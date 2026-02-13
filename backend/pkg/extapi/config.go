package extapi

import (
	"fmt"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
)

var settings model.BookingSettings

func InitConfig(s model.BookingSettings) {
	settings = s
}

func apiKey(keyType, ais string) string {
	var token Token
	utils.GetJSON(fmt.Sprintf("%sgetToken/?type=%s&ais=%s", settings.ExtAPIURL, keyType, ais), &token)
	return token.Data
}

// NewSaleToken creates new token for sales operations
func NewSaleToken() string {
	return apiKey("sales", settings.Ais[0])
}
