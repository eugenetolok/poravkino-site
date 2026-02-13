package poravkino

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/extapi"
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/jinzhu/copier"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func getLostSaleByCode(c echo.Context) error {
	var sale model.Sale
	if err := db.Preload("Performance.Movie").Where("secret = ?", c.QueryParam("secret")).Where("refund = ?", false).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.HTML(http.StatusNotFound, `<!DOCTYPE html>
		<html>
		<head>
		<style>
		  h1 {
			color: white;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		  }
		  body {
			background-color: #121212;
		  }
		</style>
		  <script>
			window.onload = function() {
			  setTimeout(function(){
				window.location.href = "/tickets";
			  }, 3000);
			}
		  </script>
		</head>
		<body>
		  <div class="text-center">
			<h1>Поиск продажи, перенаправление...</h1>
		  </div>
		</body>
		</html>`)
	}
	refreshCookie := http.Cookie{Name: "last_sale", Value: sale.Secret, Expires: time.Now().Add(365 * 24 * time.Hour), Path: "/"}
	c.SetCookie(&refreshCookie)
	return c.Redirect(http.StatusTemporaryRedirect, "/tickets")
}

func getSaleByExternalID(c echo.Context) error {
	var sale model.Sale
	if err := db.Preload("Performance.Movie").Where("external_id = ?", c.Param("id")).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such sale"}`)
	}
	return c.JSON(http.StatusOK, sale)
}

func getSaleByCode(c echo.Context) error {
	var sale model.Sale
	var saleOut model.SaleOut
	if err := db.Preload("Performance.Movie").Where("secret = ?", c.QueryParam("secret")).Where("refund = ?", false).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "продажа не найдена"}`)
	}
	if sale.BankOrderStatus == 2 && len(sale.Tickets) == 0 {
		extapi.GetSale(&sale)
		db.Save(&sale)
	}
	copier.Copy(&saleOut, &sale)
	return c.JSON(http.StatusOK, saleOut)
}

func returnSaleBooking(c echo.Context) error {
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
	log.Println("Success of returning sale:", sale.ID)
	db.Save(&sale)
	return c.JSON(http.StatusOK, sale)
}

func searchSale(c echo.Context) error {
	var (
		sales      []model.Sale
		searchSale model.SearchSale
	)
	c.Bind(&searchSale)
	searchSale.Query = strings.ToLower("%" + searchSale.Query + "%")
	from, _ := time.Parse("2006-01-02", searchSale.DateFrom)
	to, _ := time.Parse("2006-01-02", searchSale.DateTo)

	if err := db.Preload("Performance.Movie").
		Where("(created_at BETWEEN ? AND ?) AND (secret LIKE ? OR email LIKE ? OR phone LIKE ? OR CAST(external_id AS TEXT) LIKE ?)",
			from, to, searchSale.Query, searchSale.Query, searchSale.Query, searchSale.Query).
		Order("id DESC").
		Limit(searchSale.Limit).
		Find(&sales).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "No such sale"}`)
	}
	return c.JSON(http.StatusOK, sales)
}

// 1 Created sale -> create external sale -> create payment form
// 	2.1 Approve sale -> approve sale
// 		2.1.1 Try find order: if not found - problem unresolved
// 		2.1.2 Try check sber status: if not found - problem step 1
// 		2.1.3 Try check booking status: if not found - problem step 2
// 	2.2 Fail sale -> processing
// 		2.2.1 Check problem step
//  	2.2.2 If sber -> try 5 times to reach sberbank
//  	2.2.3 If booking -> try 5 times to reach booking
// 3 Answer to client
// 	3.1 If error -> send message to telegram chanel
//  3.2 If success -> redirect to tickets

func processing(c echo.Context) error {
	var sale model.Sale
	token := c.QueryParam("token")
	if err := db.Where("secret = ?", token).First(&sale).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.HTML(http.StatusNotFound, stringSaleNotFound)
	}
	return c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("/api/sales/code/lost?secret=%s", sale.Secret))
}
