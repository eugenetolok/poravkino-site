package model

import (
	"time"
)

type (
	// Movie - struct contains all info about movie
	MovieIn struct {
		Name            string `json:"name"`
		NameSecondary   string `json:"name_secondary"`
		Genres          string `json:"genres"`
		Age             int64  `json:"age"`
		Description     string `json:"description"`
		Duration        int64  `json:"duration"`
		Actors          string `json:"actors"`
		Youtube         string `json:"youtube"`
		Country         string `json:"country"`
		Director        string `json:"director"`
		Poster          string `json:"poster"`
		Backdrop        string `json:"backdrop"`
		IsPushkin       bool   `json:"is_pushkin"`
		RentCertificate string `json:"rent_certificate"`
		Index           int64  `json:"index"` // index for sort
	}
	// Movie - struct contains all info about movie
	Movie struct {
		Common
		ExternalID      int64         `json:"external_id"`
		Name            string        `json:"name"`
		NameSecondary   string        `json:"name_secondary"`
		Genres          string        `json:"genres"`
		Age             int64         `json:"age"`
		Description     string        `json:"description"`
		Duration        int64         `json:"duration"`
		AddDuration     int64         `json:"add_duration"` // duration for adds
		Premiere        time.Time     `json:"premiere"`
		Actors          string        `json:"actors"`
		Youtube         string        `json:"youtube"`
		Country         string        `json:"country"`
		Director        string        `json:"director"`
		Poster          string        `json:"poster"`
		Backdrop        string        `json:"backdrop"`
		IsPushkin       bool          `json:"is_pushkin"`
		IsActive        bool          `json:"is_active"`
		Index           int64         `json:"index"` // index for sort
		RentCertificate string        `json:"rent_certificate"`
		Performances    []Performance `json:"performances"`
	}
	MovieImage struct {
		Title  string
		Poster string
		Images []string
	}
	MovieKinopoisk struct {
		Films []struct {
			Title       string `json:"nameRU"`
			Description string `json:"description"`
			Countries   []struct {
				Country string `json:"country"`
			} `json:"countries"`
			Poster string `json:"posterUrl"`
			Images []struct {
				FilePath string `json:"url"`
			} `json:"screenshots"`
		} `json:"films"`
	}
)
