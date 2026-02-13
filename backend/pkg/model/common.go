package model

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// Common is a base model structure
type (
	Common struct {
		ID        uint       `gorm:"primaryKey" json:"id"`
		CreatedAt time.Time  `json:"-"`
		UpdatedAt time.Time  `json:"-"`
		DeletedAt *time.Time `gorm:"index" json:"-"`
	}

	Flags struct {
		UpdateSchedule bool `json:"updateSchedule"`
		ShowYamlStruct bool `json:"showYamlStruct"`
		Migrate        bool `json:"migrate"`
		DropTable      bool `json:"drop"`
		AddUser        bool `json:"user"`
	}
	Token struct {
		Token string `json:"token"`
	}
	// JwtCustomClaims are custom claims extending default ones.
	// See https://github.com/golang-jwt/jwt for more examples
	JwtCustomClaims struct {
		ID   uint   `json:"name"`
		Role string `json:"role"`
		jwt.RegisteredClaims
	}
)
