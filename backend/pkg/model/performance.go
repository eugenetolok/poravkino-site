package model

import (
	"time"
)

// Performance - struct contains all info about performance
type (
	Performance struct {
		Common
		Time       time.Time `json:"time"`
		Price      int64     `json:"price"`
		ThreeD     bool      `json:"is3d"`
		IsActive   bool      `json:"is_active"`
		MovieID    int64     `json:"movie_id"`
		ExternalID int64     `json:"external_id"`
		HallName   string    `json:"hall_name"`
		Movie      Movie     `json:"movie"`
		Places     []Place   `json:"places" gorm:"-"`
	}
)
