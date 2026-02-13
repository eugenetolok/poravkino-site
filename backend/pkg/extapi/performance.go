package extapi

import (
	"errors"
	"fmt"

	"github.com/eugenetolok/go-poravkino/pkg/utils"
)

// GetPlaces returns
func GetPerformance(extPerformanceID int64, withPlaces int64) (Performance, error) {
	var places Performance
	// Get performance data
	utils.GetJSON(fmt.Sprintf("%sschedule/performance/?id=%d&withPlaces=%d&token=%s",
		settings.ExtAPIURL,
		extPerformanceID,
		withPlaces,
		apiKey("base", settings.Ais[0])),
		&places)
	if places.Code != 0 {
		return places, errors.New(places.Message)
	}
	return places, nil
}
