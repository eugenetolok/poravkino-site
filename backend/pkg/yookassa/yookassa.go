package yookassa

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/eugenetolok/go-poravkino/pkg/model"
)

const (
	baseURL = "https://api.yookassa.ru/v3"
)

var yookassaSettings model.BankSettings

type YookassaPaymentResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	Amount struct {
		Value    string `json:"value"`
		Currency string `json:"currency"`
	} `json:"amount"`
	Confirmation struct {
		Type            string `json:"type"`
		ConfirmationURL string `json:"confirmation_url"`
	} `json:"confirmation"`
	RefundedAmount struct {
		Value    string `json:"value"`
		Currency string `json:"currency"`
	} `json:"refunded_amount"`
}

type YookassaRefundResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	Amount struct {
		Value    string `json:"value"`
		Currency string `json:"currency"`
	} `json:"amount"`
}

func InitConfig(banks []model.BankSettings) {
	yookassaSettings = banks[0]
}

func CreatePayment(sale *model.Sale, form *string) error {
	payload := map[string]interface{}{
		"amount": map[string]string{
			"value":    fmt.Sprintf("%.2f", float64(sale.Amount)),
			"currency": "RUB",
		},
		"capture": true,
		"confirmation": map[string]string{
			"type":       "redirect",
			"return_url": yookassaSettings.ReturnURL + "?secret=" + sale.Secret,
		},
		"description": fmt.Sprintf("Заказ %d-%s", sale.ExternalID, sale.Secret),
		"receipt": map[string]interface{}{
			"customer": map[string]interface{}{
				"email": sale.Email,
			},
			"items": []map[string]interface{}{
				{
					"description": fmt.Sprintf("Кинопоказ по заказу № %d-%s", sale.ExternalID, sale.Secret),
					"quantity":    "1",
					"amount": map[string]interface{}{
						"value":    fmt.Sprintf("%.2f", float64(sale.Amount)),
						"currency": "RUB",
					},
					"vat_code":        "1",
					"payment_mode":    "full_payment",
					"payment_subject": "service",
				},
			},
		},
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	fmt.Println("json payload:\n", string(jsonPayload))

	req, err := http.NewRequest("POST", baseURL+"/payments", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}

	req.SetBasicAuth(yookassaSettings.Login, yookassaSettings.Password)
	req.Header.Set("Idempotence-Key", sale.Secret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	fmt.Println("body:", string(body))

	var paymentResponse YookassaPaymentResponse
	err = json.Unmarshal(body, &paymentResponse)
	if err != nil {
		return err
	}

	fmt.Println("paymentResponse", paymentResponse)
	if paymentResponse.Status != "pending" {
		return errors.New("unexpected payment status")
	}

	sale.BankOrderID = paymentResponse.ID
	*form = paymentResponse.Confirmation.ConfirmationURL

	return nil
}

func CheckStatus(sale *model.Sale) {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/payments/%s", baseURL, sale.BankOrderID), nil)
	if err != nil {
		return
	}

	req.SetBasicAuth(yookassaSettings.Login, yookassaSettings.Password)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	fmt.Println("check yookassa response:", string(body))

	var paymentResponse YookassaPaymentResponse
	err = json.Unmarshal(body, &paymentResponse)
	if err != nil {
		return
	}

	switch paymentResponse.Status {
	case "pending":
		sale.BankOrderStatus = 0
	case "waiting_for_capture":
		sale.BankOrderStatus = 1
	case "succeeded":
		sale.BankOrderStatus = 2
	case "canceled":
		sale.BankOrderStatus = 3
	}
	fmt.Println("parsed response:", paymentResponse)
	refundedAmount, _ := strconv.ParseFloat(paymentResponse.RefundedAmount.Value, 64)
	if refundedAmount > 0 {
		sale.BankOrderStatus = 3
	}
}

func Return(sale *model.Sale) bool {
	return Refund(sale, sale.Amount)
}

func Refund(sale *model.Sale, amount int64) bool {
	payload := map[string]interface{}{
		"amount": map[string]string{
			"value":    fmt.Sprintf("%.2f", float64(amount)),
			"currency": "RUB",
		},
		"payment_id": sale.BankOrderID,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return false
	}

	req, err := http.NewRequest("POST", baseURL+"/refunds", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return false
	}

	req.SetBasicAuth(yookassaSettings.Login, yookassaSettings.Password)
	req.Header.Set("Idempotence-Key", sale.Secret+"-refund")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false
	}

	fmt.Println("refund yookassa response:", string(body))

	var refundResponse YookassaRefundResponse
	err = json.Unmarshal(body, &refundResponse)
	if err != nil {
		return false
	}

	if refundResponse.Status == "succeeded" {
		sale.BankOrderStatus = 3
	}

	return refundResponse.Status == "succeeded"
}
