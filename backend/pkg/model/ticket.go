package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// Ticket - struct contains all info about ticket
type Ticket struct {
	Row          string `json:"row"`
	Seat         string `json:"seat"`
	Price        int64  `json:"price"`
	ExternalCode string `json:"external_code"`
}

type Tickets []Ticket

func (t *Tickets) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(bytes, t)
}

func (t Tickets) Value() (driver.Value, error) {
	return json.Marshal(t)
}
