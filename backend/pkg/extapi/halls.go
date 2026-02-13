package extapi

import (
	"fmt"

	"github.com/eugenetolok/go-poravkino/pkg/utils"
)

func GetHalls() map[int][]Place {
	var halls Halls
	var hallsMap = make(map[int][]Place)
	utils.GetJSON(fmt.Sprintf("%scinemas/halls/?hallId=&token=%s", settings.ExtAPIURL, apiKey("base", settings.Ais[0])), &halls)
	for _, hall := range halls.Data {
		hallsMap[hall.ID] = hall.Places
	}
	return hallsMap
}
