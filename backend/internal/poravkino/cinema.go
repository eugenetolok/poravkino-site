package poravkino

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/skip2/go-qrcode"
)

func cinema(c echo.Context) error {
	return c.JSON(http.StatusOK, appSettings.CinemaSettings)
}

func qr(c echo.Context) error {
	secret := c.QueryParam("secret")
	if len(secret) > 15 {
		return c.String(http.StatusBadRequest, `{"error": "bad code"}`)
	}
	var png []byte
	png, err := qrcode.Encode(secret, qrcode.Medium, 340)
	if err != nil {
		return c.String(http.StatusBadRequest, `{"error": "bad code"}`)
	}
	return c.Blob(http.StatusOK, "image/png", png)
}
