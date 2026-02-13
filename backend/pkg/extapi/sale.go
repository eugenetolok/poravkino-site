package extapi

import (
	"errors"
	"fmt"
	"log"
	"strconv"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
)

// CreateSale - function which creates new sale at extapi
func CreateSale(preSale model.PreSale, sale *model.Sale) error {
	if len(preSale.Places) == 0 {
		return errors.New("zero places count")
	}
	sale.ExternalToken = apiKey("sales", settings.Ais[0])
	var externalSale ExternalSale

	for key, place := range preSale.Places {
		reservationType := "add"
		performanceUrlPart := ""
		if key == 0 {
			reservationType = "new"
			performanceUrlPart = "&performanceId=" + strconv.FormatInt(sale.ExternalPerformanceID, 10)
		}
		utils.GetJSON(settings.ExtAPIURL+"salePlaceReservation/"+reservationType+"/?placeId="+strconv.FormatInt(place, 10)+performanceUrlPart+"&token="+sale.ExternalToken, &externalSale)
		if externalSale.Code != 0 {
			return errors.New("salePlaceReservation add error")
		}
	}

	fmt.Println("place", externalSale.Data.Places)
	for _, place := range externalSale.Data.Places {
		sale.Amount += place
	}
	stringSaleID, _ := strconv.Atoi(externalSale.Data.SaleID)
	sale.ExternalID = int64(stringSaleID)
	return nil
}

// AutoRemoveSale - function which removes sale at extapi automatically
func AutoRemoveSale(sale *model.Sale) bool {
	var externalSale Sale
	var pushkin string
	if sale.IsPushkin {
		pushkin = fmt.Sprintf("&pushkinCardRrn=%s&pushkinCardTerminalId=%s&pushkinCardTerminalOwner=%s&pushkinCardPaymentType=1",
			sale.RRN,
			sale.TerminalID,
			sale.TerminalOwner)
	}
	utils.GetJSON(fmt.Sprintf("%ssaleRemove/?saleId=%d%s&token=%s", settings.ExtAPIURL, sale.ExternalID, pushkin, sale.ExternalToken), &externalSale)
	sale.Refund = true
	return externalSale.Code == 0
}

// RemoveSale - function which removes sale at extapi
func RemoveSale(sale *model.Sale) bool {
	var externalSale Sale
	var pushkin string
	if sale.IsPushkin {
		pushkin = fmt.Sprintf("&pushkinCardRrn=%s&pushkinCardTerminalId=%s&pushkinCardTerminalOwner=%s&pushkinCardPaymentType=1",
			sale.RRN,
			sale.TerminalID,
			sale.TerminalOwner)
	}
	utils.GetJSON(fmt.Sprintf("%ssaleRemove/?saleId=%d%s&token=%s", settings.ExtAPIURL, sale.ExternalID, pushkin, apiKey("sales", settings.Ais[0])), &externalSale)
	sale.Refund = true
	addTickets(sale, externalSale)
	return externalSale.Code == 0
}

// ApproveSale - function which approves sale at extapi
func ApproveSale(sale *model.Sale) bool {
	var externalSale Sale
	if sale.IsPushkin {
		utils.GetJSON(settings.ExtAPIURL+"saleApproved/?saleExternalId="+sale.Secret+"&salePerson="+utils.SanitizeInput([]string{sale.FIO, sale.Phone}, "|")+"&pushkinCardRrn="+sale.RRN+"&pushkinCardTerminalId="+sale.TerminalID+"&pushkinCardTerminalOwner="+sale.TerminalOwner+"&pushkinCardPaymentType=1&token="+sale.ExternalToken, &externalSale)
	} else {
		utils.GetJSON(settings.ExtAPIURL+"saleApproved/?saleExternalId="+sale.Secret+"&salePerson="+utils.SanitizeInput([]string{sale.Phone}, "|")+"&token="+sale.ExternalToken, &externalSale)
	}
	if externalSale.Code != 0 {
		return false
	}
	sale.ExternalCode = int64(externalSale.Code)
	sale.ExternalMessage = externalSale.Message
	addTickets(sale, externalSale)
	return true
}

// GetSale ...
func GetSale(sale *model.Sale) error {
	var externalSale Sale
	for _, ais := range settings.Ais {
		utils.GetJSON(fmt.Sprintf("%ssaleInfo/?saleId=%d&token=%s", settings.ExtAPIURL, sale.ExternalID, apiKey("sales", ais)), &externalSale)
		if externalSale.Code == 0 {
			// bookingRequest = true
			break
		}
	}
	if externalSale.Code != 0 {
		log.Println("wrong secret code!")
		return errors.New("wrong sale")
	}

	prePerformanceID, _ := strconv.Atoi(externalSale.Data.PerformanceID)
	sale.PerformanceID = int64(prePerformanceID)
	addTickets(sale, externalSale)
	return nil
}

// GetSale ...
func GetSaleSecret(sale *model.Sale) error {
	var externalSale Sale
	for _, ais := range settings.Ais {
		utils.GetJSON(fmt.Sprintf("%ssaleInfo/?saleId=%d&token=%s", settings.ExtAPIURL, sale.ExternalID, apiKey("sales", ais)), &externalSale)
		if externalSale.Code == 0 {
			break
		}
	}
	if externalSale.Code != 0 {
		log.Println("wrong secret code!")
		return errors.New("wrong sale")
	}
	prePerformanceID, _ := strconv.Atoi(externalSale.Data.PerformanceID)
	sale.PerformanceID = int64(prePerformanceID)
	sale.Secret = externalSale.Data.SaleExternalID
	addTickets(sale, externalSale)
	return nil
}

func addTickets(sale *model.Sale, externalSale Sale) {
	tempSeatRow := externalSale.Data.FullInfo.Places
	var tempTickets []model.Ticket
	for index, externalTicket := range externalSale.Data.Tickets {
		var tempTicket model.Ticket
		prePrice, _ := strconv.Atoi(externalTicket.Price)
		tempTicket.Price = int64(prePrice)
		tempTicket.ExternalCode = externalTicket.UniqueCode
		tempTicket.Row = tempSeatRow[index].RowName
		tempTicket.Seat = tempSeatRow[index].ObjectName
		tempTickets = append(tempTickets, tempTicket)
	}
	sale.Tickets = tempTickets
}

// CheckSale checks if sale payed
func CheckSale(sale *model.Sale) bool {
	var externalSale Sale
	utils.GetJSON(settings.ExtAPIURL+"saleInfo/?saleId="+strconv.FormatInt(sale.ExternalID, 10)+"&token="+sale.ExternalToken, &externalSale)
	return externalSale.Data.IsPaid != "0"
}
