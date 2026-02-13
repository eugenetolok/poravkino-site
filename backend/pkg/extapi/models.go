package extapi

type (
	Token struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    string `json:"data"`
	}

	Sale struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			IsPaid         string `json:"isPaid"`
			PerformanceID  string `json:"performanceId"`
			SaleExternalID string `json:"saleExternalId"`
			FullInfo       struct {
				Places []struct {
					RowName    string `json:"rowName"`
					ObjectName string `json:"objectName"`
				} `json:"places"`
			} `json:"fullInfo"`
			Tickets []struct {
				Price      string `json:"price"`
				UniqueCode string `json:"uniqueCode"`
			} `json:"tickets"`
		} `json:"data"`
	}

	ExternalSale struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			SaleID string           `json:"saleId"`
			Places map[string]int64 `json:"places"`
		} `json:"data"`
	}

	Place struct {
		ID        int64  `json:"id"`
		HallID    int64  `json:"hallId"`
		CX        int64  `json:"X"`
		CY        int64  `json:"Y"`
		Row       string `json:"row"`
		Seat      string `json:"place"`
		Type      int64  `json:"type"`
		Color     string `json:"color"`
		Price     int64  `json:"price"`
		PriceZone string `json:"priceZone"`
	}

	Performance struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			ID       int              `json:"id"`
			Hall     string           `json:"hall"`
			HallID   int              `json:"hallId"`
			Film     string           `json:"film"`
			DateTime string           `json:"datetime"`
			Places   map[string]Place `json:"places"`
		} `json:"data"`
	}

	Halls struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    []Hall `json:"data"`
	}
	Hall struct {
		ID     int     `json:"id"`
		Places []Place `json:"places"`
	}

	Movie struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    struct {
			ID                 int64  `json:"id"`
			Name               string `json:"name_short"`
			NameSecondary      string `json:"name_secondary"`
			AgeLimit           int64  `json:"ageLimit"`
			AnnotationFull     string `json:"annotationFull"`
			Genre              string `json:"genre"`
			Duration           string `json:"duration"`
			PremiereDateRussia string `json:"premiereDateRussia"`
			Premiere           string `json:"premiere"`
			FullSizePoster     string `json:"fullSizePoster"`
			PushkinCardEventId string `json:"pushkinCardEventId"`
			RentCertificate    string `json:"rentCertificate"`
		} `json:"data"`
	}

	Schedule struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
		Data    []struct {
			ID                 int64  `json:"id"`
			ThreeD             string `json:"3D"`
			CinemaID           int64  `json:"cinemaId"`
			MinPrice           int64  `json:"minPrice"`
			FullSizePoster     string `json:"fullSizePoster"`
			FilmId             int64  `json:"filmId"`
			Hall               string `json:"hall"`
			Datetime           string `json:"datetime"`
			PosterPath         string `json:"poster_path"`
			BackdropPath       string `json:"backdrop_path"`
			PushkinCardEventId string `json:"pushkinCardEventId"`
		} `json:"data"`
	}
)
