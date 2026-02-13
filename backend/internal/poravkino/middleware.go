package poravkino

import (
	"net/http"
	"regexp"

	"github.com/labstack/echo/v4"
)

// IDRegex is the middleware function.
func regexID(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		match, err := regexp.MatchString("^[0-9]*$", c.Param("id"))
		if err != nil || !match {
			return c.String(http.StatusBadRequest, `{"error": "wrong id"}`)
		}
		if err := next(c); err != nil {
			c.Error(err)
		}
		return nil
	}
}
