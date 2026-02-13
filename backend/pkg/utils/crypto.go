package utils

import (
	"crypto/sha1"
	"encoding/hex"
	"time"
)

// Sha1 hash form time generator
func Sha1() string {
	// Generate sha1
	h := sha1.New()
	h.Write([]byte(time.Now().String()))
	return hex.EncodeToString(h.Sum(nil))[0:10]
}
