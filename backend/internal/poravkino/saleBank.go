package poravkino

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/extapi"
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/eugenetolok/go-poravkino/pkg/yookassa"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

const maxPlacesPerSale = 5

func newSale(c echo.Context) error {
	var preSale model.PreSale
	if err := c.Bind(&preSale); err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("err: %s", err.Error()))
	}
	if len(preSale.Places) > maxPlacesPerSale || len(preSale.Places) <= 0 {
		return c.String(http.StatusBadRequest, `{"error": "bad request, wrong length"}`)
	}

	var performance model.Performance
	if err := db.Preload("Movie").First(&performance, preSale.PerformanceID).Where("is_active = ?", true).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such performance"}`)
	}
	if preSale.Pushkin && !performance.Movie.IsPushkin {
		return c.String(http.StatusBadRequest, `{"error": "this performance is not pushkin"}`)
	}
	var sale model.Sale
	sale.ExternalPerformanceID = performance.ExternalID
	sale.PerformanceID = int64(performance.ID)
	sale.Secret = utils.Sha1()
	sale.IsPushkin = preSale.Pushkin
	sale.IP = c.RealIP()
	sale.FIO = preSale.FIO
	sale.Phone = utils.RemoveNonNumeric(preSale.Phone)

	err := extapi.CreateSale(preSale, &sale)
	if err != nil {
		extapi.RemoveSale(&sale)
		return c.String(http.StatusNotFound, `{"error": "booking system doesn't accept places"}`)
	}
	sale.Email = preSale.Email
	var form string
	err = yookassa.CreatePayment(&sale, &form)
	if err != nil {
		extapi.RemoveSale(&sale)
		fmt.Println("error is in", err.Error())
		return c.JSON(http.StatusInternalServerError, `{"error": "Payment system doesn't accept payment"}`)
	}
	sale.BankPaymentForm = form
	db.Save(&sale)
	return c.String(http.StatusOK, fmt.Sprintf(`{"url":"%s"}`, sale.BankPaymentForm))
}

// func paymentGateway(c echo.Context) error {
// 	var sale model.Sale
// 	if err := db.Where("secret = ?", c.Param("secret")).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
// 		return c.String(http.StatusNotFound, `{"error": "продажа не найдена"}`)
// 	}
// 	refreshCookie := http.Cookie{Name: "last_sale", Value: sale.Secret, Expires: time.Now().Add(365 * 24 * time.Hour), Path: "/"}
// 	c.SetCookie(&refreshCookie)
// 	return c.Redirect(http.StatusTemporaryRedirect, sale.BankPaymentForm)
// }

func checkSale(c echo.Context) error {
	var lastSale string
	lastSale = c.QueryParam("secret")
	if lastSale == "" {
		lastCookieSale, err := c.Cookie("last_sale")
		if err != nil {
			return c.String(http.StatusNotFound, `{"error": "продажа не найдена"}`)
		}
		lastSale = lastCookieSale.Value
	}
	var sale model.Sale
	if err := db.Where("secret = ?", lastSale).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.HTML(http.StatusNotFound, stringSaleNotFound)
	}
	yookassa.CheckStatus(&sale)
	if sale.BankOrderStatus != 2 {
		sale.ProblemStep = 1
		db.Save(&sale)
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("/api/sales/processing?token=%s", sale.Secret))
	}
	if !extapi.ApproveSale(&sale) {
		sale.ProblemStep = 2
		db.Save(&sale)
		return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("/api/sales/processing?token=%s", sale.Secret))
	}
	db.Save(&sale)
	refreshCookie := http.Cookie{Name: "last_sale", Value: sale.Secret, Expires: time.Now().Add(365 * 24 * time.Hour), Path: "/"}
	c.SetCookie(&refreshCookie)
	return c.Redirect(http.StatusTemporaryRedirect, "/tickets")
}

func returnSale(c echo.Context) error {
	_, role := utils.GetUser(c)
	if role != "admin" {
		return c.String(http.StatusNotFound, `{"error": "У вас нет прав для осуществления возврата"}`)
	}
	var sale model.Sale
	if err := db.Where("external_id", c.Param("id")).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such sale"}`)
	}
	if !extapi.RemoveSale(&sale) {
		return c.String(http.StatusInternalServerError, `{"error": "booking system error on sale removal"}`)
	}
	if !yookassa.Return(&sale) {
		return c.String(http.StatusInternalServerError, `{"error": "payment system doesn't accept return on sale removal"}`)
	}
	log.Println("Success of returning sale:", sale.ID)
	sale.Refund = true
	db.Save(&sale)
	return c.JSON(http.StatusOK, sale)
}

func selfRefund(c echo.Context) error {
	var sale model.Sale
	secret := c.QueryParam("secret")

	if err := db.Preload("Performance").Where("secret = ?", secret).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "продажа не найдена"}`)
	}
	currentTime := time.Now().Add(time.Hour * time.Duration(appSettings.SiteSettings.TimeZoneOffset)).UTC()
	currentTime = currentTime.Add(time.Minute * 30)
	fmt.Println("perf time:", sale.Performance.Time.UTC())
	fmt.Println("self time:", currentTime)
	if !sale.Performance.Time.After(currentTime.UTC()) {
		return c.String(http.StatusBadRequest, `{"error": "запрос сделан позднее чем за 30 минут до начала сеанса"}`)
	}
	if !extapi.RemoveSale(&sale) {
		return c.String(http.StatusInternalServerError, `{"error": "билеты были распечатаны или пользовательский возврат заблокирован"}`)
	}
	if !yookassa.Return(&sale) {
		return c.String(http.StatusInternalServerError, `{"error": "ошибка возврата в платежной системе"}`)
	}
	log.Println("Self refund:", sale.Secret)
	sale.Refund = true
	db.Save(&sale)
	return c.String(http.StatusOK, `{"message": "запрос выполнен"}`)
}

func updateSale(c echo.Context) error {
	var sale model.Sale
	if err := db.Preload("Performance.Movie").Where("external_id = ?", c.Param("id")).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such sale"}`)
	}
	extapi.GetSale(&sale)
	yookassa.CheckStatus(&sale)
	db.Save(&sale)
	return c.JSON(http.StatusOK, sale)
}

func updateSales() {
	var sales []model.Sale
	db.Where("bank_order_status = ? AND created_at > ?", 0, time.Now().Add(-15*time.Minute)).Find(&sales)
	for _, sale := range sales {
		yookassa.CheckStatus(&sale)
		if sale.BankOrderStatus == 2 && !extapi.CheckSale(&sale) {
			if extapi.ApproveSale(&sale) {
				// sale.EmailSent = true
				if sale.BankOrderStatus == 2 && len(sale.Tickets) == 0 {
					extapi.GetSale(&sale)
				}
				db.Save(&sale)
				log.Println("Success sale! Secret:", sale.Secret)
			} else {
				log.Println("Extapi sale approve error, secret:", sale.Secret)
			}
		}
	}
}
