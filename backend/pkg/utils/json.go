package utils

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"time"
)

var netTransport = &http.Transport{
	Dial: (&net.Dialer{
		Timeout: 60 * time.Second,
	}).Dial,
	TLSHandshakeTimeout: 60 * time.Second,
	TLSClientConfig:     &tls.Config{InsecureSkipVerify: true},
}

var extAPIClient = &http.Client{
	Timeout:   60 * time.Second,
	Transport: netTransport,
}

// GetJSON makes get request and returns decoded JSON
func GetJSON(url string, target interface{}) error {
	log.Println(url)
	r, err := extAPIClient.Get(url)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer r.Body.Close()

	return json.NewDecoder(r.Body).Decode(target)
}

// GetJSONWithToken makes get request and returns decoded JSON
func GetJSONWithToken(url, token string, target interface{}) error {
	log.Println(url)
	req, _ := http.NewRequest("GET", url, nil)
	client := &http.Client{}
	// add authorization header to the req
	var bearer = "Bearer " + token
	req.Header.Add("Authorization", bearer)
	// Create a Bearer string by appending string access token
	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return err
	}
	defer res.Body.Close()
	fmt.Println()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return err
	}

	fmt.Println(string(body))

	return json.Unmarshal(body, &target)
}

// PostJSON makes post request and returns decoded JSON
func PostJSON(url string, contentType string, body io.Reader, target interface{}) error {
	log.Println(url)
	r, err := extAPIClient.Post(url, contentType, body)
	if err != nil {
		return err
	}
	defer r.Body.Close()

	return json.NewDecoder(r.Body).Decode(target)
}
