package poravkino

import (
	"errors"
	"net/http"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/jinzhu/copier"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func notifications(c echo.Context) error {
	var notifications []model.Notification
	db.Find(&notifications)
	return c.JSON(http.StatusOK, notifications)
}

// getNotification
func getNotification(c echo.Context) error {
	id := c.Param("id")
	var notification model.Notification
	if err := db.Find(&notification, id).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such notification"}`)
	}
	return c.JSON(http.StatusOK, notification)
}

// updateNotification updates notification if you are admin
func updateNotification(c echo.Context) error {
	id := c.Param("id")
	var notification model.Notification
	if err := db.Find(&notification, id).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such notification"}`)
	}
	m := new(model.NotificationIn)
	if err := c.Bind(m); err != nil {
		return c.String(http.StatusBadRequest, `{"error": "bad request"}`)
	}
	copier.Copy(&notification, &m)
	db.Save(&notification)
	return c.JSON(http.StatusOK, notification)
}

// createNotification creates notification if you are admin
func createNotification(c echo.Context) error {
	var notificationIn model.NotificationIn
	if err := c.Bind(&notificationIn); err != nil {
		return c.String(http.StatusBadRequest, `{"error": "bad request"}`)
	}
	var notification model.Notification
	copier.Copy(&notification, &notificationIn)
	db.Save(&notification)
	return c.JSON(http.StatusCreated, notification)
}

// deleteNotification creates notification if you are admin
func deleteNotification(c echo.Context) error {
	id := c.Param("id")
	var notification model.Notification
	if err := db.Find(&notification, id).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such notification"}`)
	}
	db.Delete(&notification)
	return c.String(http.StatusOK, `{"success":"notification has been deleted"}`)
}
