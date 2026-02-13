package model

type (
	// PreSale contains all info about pre sale
	PreSale struct {
		UserID        int64   `json:"user_id"`
		Email         string  `json:"email"`
		PerformanceID int64   `json:"performance_id"`
		Places        []int64 `json:"places"`
		Pushkin       bool    `json:"pushkin"`
		FIO           string  `json:"fio"`
		Phone         string  `json:"phone"`
	}
	// Sale - struct contains all info about sale
	Sale struct {
		Common
		Secret                string      `json:"secret"`
		Email                 string      `json:"email"`
		Amount                int64       `json:"amount"`
		BankOrderID           string      `json:"bank_order_id"`
		BankOrderNumber       string      `json:"bank_order_number"`
		BankOrderStatus       int64       `json:"bank_order_status"`
		BankErrorMessage      string      `json:"bank_error_message"`
		BankErrorCode         int64       `json:"bank_error_code"`
		BankPaymentForm       string      `json:"bank_payment_form"`
		ExternalMessage       string      `json:"external_message"`
		ExternalID            int64       `json:"external_id"`
		ExternalCode          int64       `json:"external_code"`
		ExternalToken         string      `json:"external_token"`
		ExternalPerformanceID int64       `json:"external_performance_id"`
		PerformanceID         int64       `json:"perfomance_id"`
		Performance           Performance `json:"performance"`
		Tickets               Tickets     `json:"tickets" gorm:"type:jsonb"`
		IP                    string      `json:"ip"`
		EmailSent             bool        `json:"email_sent"`
		IsPushkin             bool        `json:"is_pushkin" `
		TerminalID            string      `json:"terminal_id"`
		TerminalOwner         string      `json:"terminal_owner"`
		RRN                   string      `json:"rrn" groups:"hidden_out"`
		ProblemStep           int64       `json:"problem_step" groups:"hidden_out"`
		Refund                bool        `json:"refund"`
		FIO                   string      `json:"fio"`
		Phone                 string      `json:"phone"`
	}
	SaleOut struct {
		Secret        string      `json:"secret"`
		Email         string      `json:"email"`
		Amount        int64       `json:"amount"`
		ExternalID    int64       `json:"external_id"`
		PerformanceID int64       `json:"perfomance_id"`
		Performance   Performance `json:"performance"`
		Tickets       Tickets     `json:"tickets" gorm:"type:jsonb"`
	}
	SearchSale struct {
		Query    string `json:"query"`
		Limit    int    `json:"limit"`
		DateFrom string `json:"date_from"`
		DateTo   string `json:"date_to"`
	}
	RefundRequest struct {
		Common
		SaleID   uint
		Valid    bool
		Executed bool
	}
)
