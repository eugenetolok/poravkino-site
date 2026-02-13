package smtp

import (
	"bytes"
	"embed"
	"fmt"
	"log"
	"strings"
	"text/template"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"gopkg.in/gomail.v2"
)

//go:embed template.htm
var templateFS embed.FS

var mailSettings model.MailSettings

func InitConfig(m model.MailSettings) {
	mailSettings = m
}

// SendTickets sends tickets to user
func SendTickets(sale model.Sale, domain string) bool {
	data, err := templateFS.ReadFile("template.htm")
	if err != nil {
		log.Print("template reading error: ", err)
		return false
	}

	// Create a template and parse the HTML
	t, err := template.New("").Parse(string(data))
	if err != nil {
		log.Print("template parsing error: ", err)
		return false
	}
	buf := new(bytes.Buffer)
	err = t.Execute(buf, sale)
	if err != nil { // if there is an error
		log.Print("template executing error: ", err)
	}

	m := gomail.NewMessage()
	m.SetHeader("From", mailSettings.From)
	m.SetHeader("To", sale.Email)
	m.SetHeader("Subject", fmt.Sprintf("Билеты: %d-%s", sale.ExternalID, sale.Secret))
	m.SetBody("text/html", strings.ReplaceAll(buf.String(), "APP_DOMAIN", domain))

	// Send the email to Bob
	d := gomail.NewDialer(mailSettings.SMTP, mailSettings.Port, mailSettings.User, mailSettings.Password)
	if err := d.DialAndSend(m); err != nil {
		log.Println("email didn't send to: " + sale.Email)
		log.Println("email err: ", err)
		return false
	}
	return true
}
