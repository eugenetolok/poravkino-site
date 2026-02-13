package utils

import (
	"regexp"
	"strings"
	"unicode"
)

// RemoveNonNumeric removes all non-numeric characters from a string
func RemoveNonNumeric(s string) string {
	var result strings.Builder
	for _, char := range s {
		if unicode.IsDigit(char) {
			result.WriteRune(char)
		}
	}
	return result.String()
}

// SanitizeInput ...
func SanitizeInput(inputs []string, delimiter string) string {
	// Create a regex pattern that matches only allowed characters (English, Russian, and numbers)
	allowedChars := regexp.MustCompile(`[a-zA-Zа-яА-Я0-9]+`)

	// Process each string in the array and sanitize it
	sanitizedParts := []string{}
	for _, input := range inputs {
		// Extract only the allowed characters
		sanitized := allowedChars.FindAllString(input, -1)
		sanitizedParts = append(sanitizedParts, strings.Join(sanitized, ""))
	}

	// Join the sanitized strings with the specified delimiter
	result := strings.Join(sanitizedParts, delimiter)

	// Limit the length to 250 characters
	if len(result) > 250 {
		result = result[:250]
	}
	return result
}
