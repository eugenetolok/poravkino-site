package model

// Hall - struct contains all info about hall
type Hall struct {
	Common
	Name       string `json:"name"`
	ExternalID int64  `json:"external_id"`
}
