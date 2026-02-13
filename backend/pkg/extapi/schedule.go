package extapi

import (
	"log"
	"strconv"
	"time"

	"github.com/eugenetolok/go-poravkino/pkg/utils"
)

func GetSchedule() Schedule {
	var schedule Schedule
	err := utils.GetJSON(settings.ExtAPIURL+"schedule/?from="+time.Now().Add(time.Hour*-12).Format("2006-01-02")+"&to="+time.Now().AddDate(0, 1, 0).Format("2006-01-02")+"&token="+apiKey("base", settings.Ais[0]), &schedule)
	if err != nil {
		log.Println("couldn't connect to booking system api")
	}
	return schedule
}

// GetMovie - function which gets movie info from extapi
func GetMovie(movieID int64) Movie {
	var movie Movie
	utils.GetJSON(settings.ExtAPIURL+"films/?id="+strconv.FormatInt(movieID, 10)+"&token="+apiKey("base", settings.Ais[0]), &movie)
	return movie
}
