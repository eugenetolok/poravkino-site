package poravkino

import (
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/extapi"
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

func schedule(c echo.Context) error {
	var movies []model.Movie
	parsedDate, err := time.Parse("2006-01-02", c.QueryParam("date"))
	if err != nil {
		return c.String(http.StatusBadRequest, `{"error": "wrong date"}`)
	}
	parsedDate = parsedDate.Add(time.Hour * time.Duration(6))
	nextDate := parsedDate.AddDate(0, 0, 1)

	err = db.Table("movies").
		Select("movies.*, COUNT(performances.id) AS performance_count").
		Joins("JOIN performances ON movies.id = performances.movie_id").
		Where("movies.is_active = ?", true).
		Where("performances.is_active = ?", true).
		Where("performances.time > ?", time.Now()).
		Where("performances.time BETWEEN ? AND ?", parsedDate, nextDate).
		Group("movies.id").
		Order("movies.index DESC, COUNT(performances.id) DESC").
		Preload("Performances", func(db *gorm.DB) *gorm.DB {
			return db.Where("is_active = ? AND time > ? AND time BETWEEN ? AND ?", true, time.Now(), parsedDate, nextDate).Order("time ASC")
		}).
		Find(&movies).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return c.String(http.StatusNotFound, `{"error": "Нет сеансов на эту дату"}`)
	}

	if err != nil {
		return c.String(http.StatusInternalServerError, `{"error": "internal server error"}`)
	}

	return c.JSON(http.StatusOK, movies)
}

// updateSchedule - updates schedule from extapi
func updateSchedule() {
	log.Println("Downloading schedule...")
	var activePerformancesExternalIDs []int64
	var activeMoviesExternalIDs []int64
	activeMoviesIDsMap := make(map[int64]struct{})
	for _, performance := range extapi.GetSchedule().Data {
		if performance.CinemaID == appSettings.BookingSettings.CinemaID {
			var tempPerformance model.Performance
			tempPerformance.MovieID = getMovieID(performance.FilmId, performance.FullSizePoster)
			db.Where("external_id = ?", performance.ID).FirstOrCreate(&tempPerformance)
			tempPerformance.ExternalID = performance.ID
			tempPerformance.Price = performance.MinPrice
			tempPerformance.HallName = performance.Hall
			tempPerformance.Time, _ = time.Parse("2006-01-02 15:04:05", performance.Datetime)
			if tempPerformance.Time.UTC().Before(time.Now().Add(time.Hour * time.Duration(appSettings.SiteSettings.TimeZoneOffset)).UTC()) {
				tempPerformance.IsActive = false
			} else {
				tempPerformance.IsActive = true
			}
			if performance.ThreeD == "yes" {
				tempPerformance.ThreeD = true
			}
			db.Save(&tempPerformance)
			if tempPerformance.IsActive {
				activePerformancesExternalIDs = append(activePerformancesExternalIDs, tempPerformance.ExternalID)
				// Add active movie to dummy map
				if _, ok := activeMoviesIDsMap[tempPerformance.MovieID]; !ok {
					activeMoviesIDsMap[tempPerformance.MovieID] = struct{}{}
				}
			}
		}
	}
	for movieID := range activeMoviesIDsMap {
		activeMoviesExternalIDs = append(activeMoviesExternalIDs, movieID)
	}
	if len(activePerformancesExternalIDs) > 0 {
		db.Table("performances").Not("external_id", activePerformancesExternalIDs).Updates(map[string]interface{}{"is_active": false})
	}
	if len(activeMoviesExternalIDs) > 0 {
		db.Table("movies").Where("id IN (?)", activeMoviesExternalIDs).Updates(map[string]interface{}{"is_active": true})
		db.Table("movies").Where("id NOT IN (?)", activeMoviesExternalIDs).Updates(map[string]interface{}{"is_active": false})
	}
}

func updateScheduleHandler(c echo.Context) error {
	updateSchedule()
	return c.String(http.StatusOK, `{"message":"success"}`)
}

func getMovieID(movieID int64, fullSizePoster string) int64 {
	var movie model.Movie
	if err := db.Where("external_id = ?", movieID).First(&movie).Error; errors.Is(err, gorm.ErrRecordNotFound) {
		tempMovie := extapi.GetMovie(movieID)
		movie.Name = tempMovie.Data.Name
		movie.NameSecondary = tempMovie.Data.NameSecondary
		var kinopoisk model.MovieKinopoisk
		kinopoisk, _ = utils.Kinopoisk(strings.Split(movie.NameSecondary, "предсеанс")[0], appSettings.SiteSettings.KinopoiskAPI)
		movie.Age = tempMovie.Data.AgeLimit
		movie.ExternalID = tempMovie.Data.ID
		movie.Description = tempMovie.Data.AnnotationFull
		if movie.Description == "" && len(kinopoisk.Films) > 0 {
			movie.Description = kinopoisk.Films[0].Description
		}
		if movie.Country == "" && len(kinopoisk.Films) > 0 {
			for _, country := range kinopoisk.Films[0].Countries {
				movie.Country += " " + country.Country
			}
		}
		movie.Genres = tempMovie.Data.Genre
		movie.Duration, _ = strconv.ParseInt(tempMovie.Data.Duration, 10, 64)
		movie.RentCertificate = tempMovie.Data.RentCertificate
		if tempMovie.Data.Premiere != "" {
			movie.Premiere, _ = time.Parse("2006-01-02", tempMovie.Data.Premiere)
		}
		if tempMovie.Data.PremiereDateRussia != "" {
			movie.Premiere, _ = time.Parse("2006-01-02", tempMovie.Data.PremiereDateRussia)
		}
		if fullSizePoster != "" {
			movie.Poster = utils.DownloadImage(fullSizePoster, 500)
		}
		if appSettings.SiteSettings.KinopoiskAPI != "" {
			if movie.Poster == "" || movie.Backdrop == "" {
				if movie.Poster == "" && len(kinopoisk.Films) > 0 {
					movie.Poster = utils.DownloadImage(kinopoisk.Films[0].Poster, 500)
				}
				if movie.Backdrop == "" && len(kinopoisk.Films) > 0 {
					if len(kinopoisk.Films[0].Images) > 0 {
						movie.Backdrop = kinopoisk.Films[0].Images[0].FilePath
					}
				}
			}
		}

		movie.Youtube = utils.MovieTrailer(movie.NameSecondary, appSettings.SiteSettings.YoutubeAPIKey)
		movie.IsPushkin = (tempMovie.Data.PushkinCardEventId != "" && len(appSettings.BanksSettings) > 1)
		db.Create(&movie)
	}
	movie.IsActive = true
	db.Save(&movie)
	return int64(movie.ID)
}
