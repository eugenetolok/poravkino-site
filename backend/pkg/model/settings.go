package model

type (
	// MenuStruct - menu on top navbar
	MenuStruct struct {
		Title     string `yaml:"title" json:"title"`
		URL       string `yaml:"url" json:"url"`
		IsInPopup bool   `yaml:"isInPopup" json:"isInPopup"`
	}
	// Carousel - carousel on about page
	Carousel struct {
		Name string `yaml:"name" json:"name"`
		URL  string `yaml:"url" json:"url"`
	}
	// CinemaSettings struct of cinema settings with initialization
	CinemaSettings struct {
		Host                    string       `yaml:"host" json:"host"`
		CinemaName              string       `yaml:"cinemaName" json:"cinemaName"`
		Menu                    []MenuStruct `yaml:"menu" json:"menu"`
		MainColor               string       `yaml:"mainColor" json:"mainColor"`
		SiteName                string       `yaml:"siteName" json:"siteName"`
		DomainName              string       `yaml:"domainName" json:"domainName"`
		CompanyName             string       `yaml:"companyName" json:"companyName"`
		EmailName               string       `yaml:"emailName" json:"emailName"`
		CityName                string       `yaml:"cityName" json:"cityName"`
		Address                 string       `yaml:"address" json:"address"`
		MapURL                  string       `yaml:"mapUrl" json:"mapUrl"`
		Support                 string       `yaml:"support" json:"support"`
		WorkURL                 string       `yaml:"workUrl" json:"workUrl"`
		ReturnURL               string       `yaml:"return_url" json:"return_url"`
		ContactPersonJob        string       `yaml:"contactPersonJob" json:"contactPersonJob"`
		ContactPerson           string       `yaml:"contactPerson" json:"contactPerson"`
		ContactPersonTip        string       `yaml:"contactPersonTip" json:"contactPersonTip"`
		ContactPersonConnection string       `yaml:"contactPersonConnection" json:"contactPersonConnection"`
		AboutHTML               string       `yaml:"aboutHtml" json:"aboutHtml"`
		AboutCarousel           []Carousel   `yaml:"aboutCarousel" json:"aboutCarousel"`
		ShowCarousel            bool         `yaml:"showCarousel" json:"showCarousel"`
		Popup                   bool         `yaml:"popup" json:"popup"`
		Logo                    string       `yaml:"logo" json:"logo"`
		QREnter                 bool         `yaml:"qr_enter" json:"qr_enter"`
		OurWidget               bool         `yaml:"ourwidget" json:"ourwidget"`
		VK                      string       `yaml:"vk" json:"vk"`
		Telegram                string       `yaml:"telegram" json:"telegram"`
		FckngQR                 string       `yaml:"fckngqr" json:"fckngqr"`
		YandexMetrika           string       `yaml:"yandex_metrika" json:"yandex_metrika"`
	}
	SiteSettings struct {
		SQLhost        string `yaml:"sql_host"`     // SQLhost - host of remote or local db (defatult - "127.0.0.1")
		SQLport        string `yaml:"sql_port"`     // SQLport - port of remote or local db (default - "5432")
		SQLdbname      string `yaml:"sql_dbname"`   // SQLdbname - database name of remote or local db (default - "app")
		SQLuser        string `yaml:"sql_user"`     // SQLuser - database username (default - "admin")
		SQLpassword    string `yaml:"sql_password"` // SQLpassword - database password (default - "admin")
		Debug          bool   `yaml:"debug"`
		AdminToken     string `yaml:"admin_token"`
		KinopoiskAPI   string `yaml:"kinopoisk_api"`
		YoutubeAPIKey  string `yaml:"youtube_api_api"`
		SecretJWT      string `yaml:"secret_jwt"`
		TimeZoneOffset int64  `yaml:"time_zone_offset"`
	}
	BankSettings struct {
		// YooKassa
		Login              string `yaml:"login"`
		Password           string `yaml:"password"`
		ReturnURL          string `yaml:"return_url"`
		FailURL            string `yaml:"fail_url"`
		SessionTimeoutSecs string `yaml:"session_timeout_secs"`
		INN                string `yaml:"inn"`
	}
	BookingSettings struct {
		ExtAPIURL     string   `yaml:"ext_api_url"`
		Ais           []string `yaml:"ais"`
		ScreenUp      bool     `yaml:"screen_up"`
		Size          int64    `yaml:"size"`
		FontColor     string   `yaml:"font_color"`
		ActiveColor   string   `yaml:"active_color"`
		BusyBackColor string   `yaml:"busy_back_color"`
		FreeBackColor string   `yaml:"free_back_color"`
		CinemaID      int64    `yaml:"cinema_id"`
	}
	MailSettings struct {
		From     string `yaml:"from"`
		SMTP     string `yaml:"smtp"`
		Port     int    `yaml:"port"`
		User     string `yaml:"user"`
		Password string `yaml:"password"`
	}
	AppSettings struct {
		CinemaSettings  `yaml:"cinema_settings"`
		SiteSettings    `yaml:"site_settings"`
		BanksSettings   []BankSettings `yaml:"banks_settings"`
		BookingSettings `yaml:"booking_settings"`
		MailSettings    `yaml:"mail_settings"`
	}
	BotSettings struct {
		TelegramBotAPI string  `yaml:"telegram_api"`
		AdminToken     string  `yaml:"admin_token"`
		SberURL        string  `yaml:"sber_url"`
		SiteURL        string  `yaml:"site_url"`
		AllowedChats   []int64 `yaml:"allowed_chats"`
	}
)
