package poravkino

import (
	"errors"
	"net/http"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// GetPerformance returns performance by id
func getPerformance(c echo.Context) error {
	performanceID := c.Param("id")
	var performance model.Performance
	if err := db.Preload("Movie").Where("is_active = ?", true).First(&performance, performanceID).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such performance"}`)
	}
	performance.Places = preparePlaces(performance.ExternalID)
	if performance.Places == nil {
		return c.String(http.StatusNotFound, `{"error": "problem with places"}`)
	}
	return c.JSON(http.StatusOK, performance)
}
