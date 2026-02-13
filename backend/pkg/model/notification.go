package model

// Notification - struct contains all info about notification
type Notification struct {
	Common
	Title      string `json:"title"`
	Text       string `json:"text"`
	PictureURL string `json:"picture_url"`
	LinkURL    string `json:"link_url"`
	IsInSlider bool   `json:"is_in_slider"`
}

// Notification - struct contains all info about notification
type NotificationIn struct {
	Title      string `json:"title"`
	Text       string `json:"text"`
	PictureURL string `json:"picture_url"`
	LinkURL    string `json:"link_url"`
	IsInSlider bool   `json:"is_in_slider"`
}
