package utils

import (
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// GetUser gets user id from JWT token
func GetUser(c echo.Context) (uint, string) {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(*model.JwtCustomClaims)
	return claims.ID, claims.Role
}
