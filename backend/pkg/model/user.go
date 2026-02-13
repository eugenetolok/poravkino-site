package model

// User model, we can add user
type User struct {
	Common
	Password string `json:"password"`
	Username string `json:"username"`
	Role     string `json:"role"`
	Frozen   bool   `json:"frozen"`
}
