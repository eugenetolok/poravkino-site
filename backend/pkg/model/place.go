package model

// Place contains place info
type Place struct {
	ID            int64  `json:"ID"`
	ObjectName    string `json:"ObjectName"`
	ObjectType    string `json:"ObjectType"`
	Width         int64  `json:"Width"`
	Height        int64  `json:"Height"`
	CX            int64  `json:"CX"`
	CY            int64  `json:"CY"`
	Angle         string `json:"Angle"`
	Row           string `json:"Row"`
	Seat          string `json:"Seat"`
	CodSec        string `json:"cod_sec"`
	NameSec       string `json:"Name_sec"`
	FreeOfferSeat string `json:"FreeOfferSeat"`
	FontColor     string `json:"FontColor"`
	FontSize      string `json:"FontSize"`
	Label         string `json:"Label"`
	BackColor     string `json:"BackColor"`
	Avail         bool   `json:"avail"`
	NameSecMin    string `json:"name_sec"`
	Price         int64  `json:"Price"`
	ActiveColor   string `json:"ActiveColor"`
}
