package poravkino

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/jinzhu/copier"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

// GetMovie returns movie by id
func getMovie(c echo.Context) error {
	movieID := c.Param("id")
	var movie model.Movie
	parsedDate, err := time.Parse("2006-01-02", c.QueryParam("date"))
	if err != nil {
		parsedDate = time.Now()
	}
	parsedDate = parsedDate.Add(time.Hour * time.Duration(6))
	if err := db.Preload("Performances", func(db *gorm.DB) *gorm.DB {
		return db.Order("performances.time ASC").Where("is_active = ?", true).Where("time BETWEEN ? AND ?", parsedDate, parsedDate.AddDate(0, 0, 1))
	}).First(&movie, movieID).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such movie"}`)
	}
	return c.JSON(http.StatusOK, movie)
}

// UpdateMovie updates movie if it belongs to you or you are admin
func updateMovie(c echo.Context) error {
	movieID := c.Param("id")
	var movie model.Movie
	if err := db.First(&movie, movieID).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no such movie"}`)
	}
	m := new(model.MovieIn)
	if err := c.Bind(m); err != nil {
		fmt.Println("movie error", err.Error())
		return c.String(http.StatusBadRequest, `{"error": "bad request"}`)
	}
	copier.Copy(&movie, &m)
	db.Save(&movie)
	return c.JSON(http.StatusOK, movie)
}

// GetMovies returns all movies
func getMovies(c echo.Context) error {
	var movies []model.Movie
	if err := db.Where("is_active = ?", true).Find(&movies).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "no movies"}`)
	}
	return c.JSON(http.StatusOK, movies)
}
