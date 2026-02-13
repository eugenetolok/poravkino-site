package poravkino

import (
	"net/http"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// Auth ...
type Auth struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func authUser(c echo.Context) error {
	var auth Auth
	if err := c.Bind(&auth); err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	if auth.Username == "" || auth.Password == "" {
		return c.String(http.StatusBadRequest, `{"error":"bad request"}`)
	}
	var user model.User
	if err := db.Where("username = ? AND password = ?", auth.Username, auth.Password).First(&user).Error; err != nil {
		return c.String(http.StatusUnauthorized, `{"error":"user is not found"}`)
	}

	// Set custom claims
	claims := &model.JwtCustomClaims{
		ID:   user.ID,
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 1000)),
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte(appSettings.SiteSettings.SecretJWT))
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": t,
	})
}

// MyUser ...
type MyUser struct {
	ID   uint   `json:"id"`
	Role string `json:"role"`
}

func me(c echo.Context) error {
	var user MyUser
	user.ID, user.Role = utils.GetUser(c)
	return c.JSON(http.StatusOK, user)
}
