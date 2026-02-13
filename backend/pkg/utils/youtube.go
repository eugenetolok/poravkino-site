package utils

import (
	"log"
	"net/url"
)

func MovieTrailer(movieName, youtubeAPIKey string) string {
	var youtubeResponse map[string]interface{}
	GetJSON("https://www.googleapis.com/youtube/v3/search?part=snippet&q="+url.QueryEscape("трейлер "+movieName)+"&maxResults=1&type=video&key="+youtubeAPIKey, &youtubeResponse)
	tmp1, ok1 := youtubeResponse["items"].([]interface{})
	if !ok1 {
		log.Println("couldn't decode youtube response")
		return ""
	}
	if len(tmp1) == 0 {
		log.Println("youtube coudnt find anything")
		return ""
	}
	tmp2 := tmp1[0].(map[string]interface{})
	tmp3, ok3 := tmp2["id"].(map[string]interface{})
	if !ok3 {
		log.Println("decoded youtube response, but something went wrong")
		return ""
	}
	tmp4, ok4 := tmp3["videoId"].(string)
	if !ok4 {
		log.Println("decoded youtube response, but something went wrong")
		return ""
	}
	return tmp4
}
