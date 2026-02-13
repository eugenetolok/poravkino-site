package poravkino

import (
	"log"
	"net/http"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/golang-jwt/jwt/v4"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func API(e *echo.Echo) {
	var jwtConfig = echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(model.JwtCustomClaims)
		},
		SigningKey: []byte(appSettings.SiteSettings.SecretJWT),
		ErrorHandler: func(c echo.Context, err error) error {
			// Log the error or return a custom error message
			log.Printf("JWT Error: %v", err)
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid or expired JWT")
		},
	}
	e.POST("/api/auth", authUser)
	// admin
	e.GET("/api/auth", authUser)
	// captcha
	e.GET("/api/captcha", checkCapthca)
	// e.POST("/refreshToken", refreshTokens)
	// Cinema
	e.GET("/api/cinema", cinema, middleware.Static("test"))
	// Movies
	e.GET("/api/movies", getMovies)
	e.GET("/api/movies/:id", getMovie, regexID)
	// Performances
	e.GET("/api/performances/:id", getPerformance, regexID)
	// Notifications
	e.GET("/api/notifications", notifications)
	// Schedule
	e.GET("/api/schedule", schedule)
	// Sale
	e.POST("/api/sales", newSale)
	// e.GET("/api/sales/fail", failSale)
	e.GET("/api/sales/check", checkSale)
	e.GET("/api/sales/code", getSaleByCode)
	// e.GET("/api/sales/code/id", getSaleByCodeID)
	e.GET("/api/sales/code/lost", getLostSaleByCode) // , capthaTooManyRequests(15)
	// e.GET("/api/sales/checkSaleByOperator", checkSaleByOperator)
	e.GET("/api/sales/processing", processing)
	e.GET("/api/sales/selfRefund", selfRefund) // , capthaTooManyRequests(3)
	e.GET("/api/ip", func(c echo.Context) error {
		return c.String(http.StatusOK, c.RealIP())
	})
	// qr
	e.GET("/api/qr", qr)
	// paymentGateway
	// e.GET("/api/paymentGateway/:secret", paymentGateway)

	// Restricted group
	r := e.Group("/api")
	// Configure middleware with the custom claims type
	r.Use(echojwt.WithConfig(jwtConfig))
	// Notifications
	// me
	r.GET("/me", me)
	r.POST("/notifications", createNotification)
	r.GET("/notifications/:id", getNotification)
	r.PUT("/notifications/:id", updateNotification)
	r.DELETE("/notifications/:id", deleteNotification)
	// Sales
	r.POST("/sales/search", searchSale)
	r.GET("/sales/:id", getSaleByExternalID)
	r.GET("/sales/update/:id", updateSale)
	r.GET("/sales/return/:id", returnSale)
	r.GET("/sales/returnBooking/:id", returnSaleBooking)
	// Movies - to restrict
	r.PUT("/movies/:id", updateMovie)
	// Images - to restrict
	r.POST("/images", postImage)
	// Update schedule
	r.GET("/update", updateScheduleHandler)
}
