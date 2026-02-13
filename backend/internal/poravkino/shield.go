package poravkino

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"

	"github.com/dchest/captcha"
	"github.com/labstack/echo/v4"
)

// const allowedTimes = 1

type (
	IP struct {
		Times int
		Code  string
	}
)

// IP shield
var (
	ipMap = make(map[string]IP)
	lock  = sync.RWMutex{}
)

func readIP(ip string) IP {
	lock.RLock()
	defer lock.RUnlock()
	return ipMap[ip]
}

func writeIP(ip, code string) {
	lock.Lock()
	defer lock.Unlock()
	var w IP
	w.Times = ipMap[ip].Times + 1
	if code != "" {
		w.Code = code
	} else {
		w.Code = ipMap[ip].Code
	}
	ipMap[ip] = w
}

func clearIPMap() {
	for k := range ipMap {
		delete(ipMap, k)
	}
}

func capthaTooManyRequests(allowedTimes int) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ip := c.RealIP()
			// log.Println("ip:", ip)
			if readIP(ip).Times > allowedTimes {
				id := captcha.New()
				code := genCaptchaCode()
				png := captcha.NewImage(id, code, captcha.StdWidth, captcha.StdHeight)
				buffer := new(bytes.Buffer)
				if _, err := png.WriteTo(buffer); err != nil {
					log.Println("unable to write image.")
				}
				codeStr := convert(code)
				writeIP(ip, codeStr)
				image := base64.StdEncoding.EncodeToString(buffer.Bytes())
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"image": image,
				})
			}
			writeIP(ip, "")
			if err := next(c); err != nil {
				c.Error(err)
			}
			return nil
		}
	}
}

func checkCapthca(c echo.Context) error {
	code := c.QueryParam("code")
	ipMapCode := readIP(c.RealIP()).Code
	log.Println("code", code)
	log.Println("IPMap code", ipMapCode)
	if ipMapCode == code {
		delete(ipMap, c.RealIP())
		return c.String(http.StatusOK, `{"message":"success"}`)
	}
	return c.String(http.StatusBadRequest, `{"error":"bad request"}`)
}

func convert(b []byte) string {
	s := make([]string, len(b))
	for i := range b {
		s[i] = strconv.Itoa(int(b[i]))
	}
	return strings.Join(s, "")
}

// func captchaImg(c echo.Context) error {
// 	id := captcha.New()
// 	code := genCaptchaCode()
// 	png := captcha.NewImage(id, code, captcha.StdWidth, captcha.StdHeight)
// 	buffer := new(bytes.Buffer)
// 	if _, err := png.WriteTo(buffer); err != nil {
// 		log.Println("unable to write image.")
// 	}

// 	image := base64.StdEncoding.EncodeToString(buffer.Bytes())
// 	return c.JSON(http.StatusOK, map[string]interface{}{
// 		"image": image,
// 		"key":   code,
// 	})
// }

func genCaptchaCode() []byte {
	codes := make([]byte, 6)
	rand.Read(codes)

	for i := 0; i < 6; i++ {
		codes[i] = uint8((codes[i] % 10))
	}
	return codes
}
