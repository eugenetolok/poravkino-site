package poravkino

import (
	"strconv"
	"strings"

	"github.com/eugenetolok/go-poravkino/pkg/extapi"
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/jinzhu/copier"
)

const objectType = "Place"

func preparePlaces(performaceExternalID int64) []model.Place {
	availablePlaces, err := extapi.GetPerformance(performaceExternalID, 1)
	if err != nil {
		return nil
	}
	hallPlaces := halls[availablePlaces.Data.HallID]
	var frontendPlaces []model.Place
	var rows = make(map[string]int64)
	var xMax, yMax int64
	for _, hallPlace := range hallPlaces {
		availPlace, ok := availablePlaces.Data.Places[strconv.FormatInt(hallPlace.ID, 10)]
		var p model.Place
		copier.Copy(&p, &hallPlace)
		p.BackColor = appSettings.BookingSettings.BusyBackColor
		if ok {
			p.Avail = true
			p.Price = availPlace.Price
			p.Row = availPlace.Row
			p.Seat = availPlace.Seat
			p.BackColor = appSettings.BookingSettings.FreeBackColor
		}
		// Get biggest X and Y of scheme
		if xMax < hallPlace.CX {
			xMax = hallPlace.CX
		}
		if yMax < hallPlace.CY {
			yMax = hallPlace.CY
		}
		// Add row to rows slice
		if _, ok := rows[hallPlace.Row]; !ok {
			rows[hallPlace.Row] = hallPlace.CY
		}
		fillPlace(&p, &hallPlace)
		frontendPlaces = append(frontendPlaces, p)
	}
	addScreenAndLabels(&frontendPlaces, xMax, yMax, rows)
	return frontendPlaces
}

func addScreenAndLabels(places *[]model.Place, xMax, yMax int64, rows map[string]int64) {
	for index, row := range rows {
		var leftRow model.Place
		var rightRow model.Place
		fillLabel(&leftRow)
		leftRow.CX = 20
		leftRow.CY = row + 25
		leftRow.NameSec = index
		rightRow = leftRow
		rightRow.CX = xMax + 85
		*places = append(*places, leftRow)
		*places = append(*places, rightRow)
	}
	var screenRow model.Place
	fillLabel(&screenRow)
	screenRow.CX = xMax/2 + 65
	if appSettings.BookingSettings.ScreenUp {
		screenRow.CY = 0
	} else {
		screenRow.CY = yMax + 80
	}
	screenRow.FontColor = "0d76ff"
	screenRow.NameSec = strings.Repeat("____", int(xMax)/42)
	*places = append(*places, screenRow)
	var dummyRow model.Place
	fillLabel(&dummyRow)
	dummyRow.CX = -15
	dummyRow.FontSize = ""
	*places = append(*places, dummyRow)
}

func fillLabel(label *model.Place) {
	label.ObjectName = "Label"
	label.ObjectType = "Label"
	label.Width = appSettings.BookingSettings.Size
	label.Height = appSettings.BookingSettings.Size
	label.CX = 0
	label.CY = 0
	label.FontColor = "FFFFFF"
	label.FontSize = "8"
}

func fillPlace(place *model.Place, hallPlace *extapi.Place) {
	place.Width = appSettings.BookingSettings.Size
	place.Height = appSettings.BookingSettings.Size
	place.ObjectType = objectType
	place.ObjectName = objectType
	place.FontColor = appSettings.BookingSettings.FontColor
	place.CX = place.CX + 15
	if hallPlace.Type == 2 {
		place.CX = place.CX - 10
	}
	if hallPlace.Type == 3 {
		place.CX = place.CX + 10
	}
}
