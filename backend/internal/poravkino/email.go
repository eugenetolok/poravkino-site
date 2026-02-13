package poravkino

import (
	"log"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/smtp"
)

func sendEmails() {
	var sales []model.Sale
	db.Preload("Performance.Movie").Where("bank_order_status = ? AND email_sent = ? AND created_at > ?", 2, false, time.Now().Add(-15*time.Minute)).Find(&sales)
	for _, sale := range sales {
		smtp.SendTickets(sale, appSettings.CinemaSettings.DomainName)
		sale.EmailSent = true
		db.Save(&sale)
		log.Printf("Email sent for sale %d with secret %s sent to email %s", sale.ExternalID, sale.Secret, sale.Email)
	}
}
