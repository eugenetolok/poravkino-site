package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"

	"github.com/eugenetolok/go-poravkino/pkg/model"
)

func Kinopoisk(movieName, kinopoiskAPI string) (model.MovieKinopoisk, error) {
	var data model.MovieKinopoisk
	url := fmt.Sprintf("https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=%s&page=1", url.QueryEscape(movieName))
	fmt.Println(url)
	client := &http.Client{}

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("X-API-KEY", kinopoiskAPI)
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return data, errors.New("can't connect 1")
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return data, errors.New("can't connect 2")
	}

	fmt.Println(string(body))

	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println(err)
		return data, errors.New("can't unmarshal")
	}

	if len(data.Films) == 0 {
		fmt.Println("No movie found")
		return data, errors.New("no movie found")
	}

	return data, nil
}

func Tmdb(movieName, TmdbAPI string) string {
	url := fmt.Sprintf("https://api.tmdb.org/3/search/movie?api_key=%s&query=%s", TmdbAPI, movieName)

	res, err := http.Get(url)
	if err != nil {
		fmt.Println(err)
		return ""
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return ""
	}

	var data struct {
		Results []struct {
			Title  string `json:"title"`
			Poster string `json:"poster_path"`
			Images []struct {
				FilePath string `json:"file_path"`
			} `json:"images"`
		} `json:"results"`
	}

	err = json.Unmarshal(body, &data)
	if err != nil {
		fmt.Println(err)
		return ""
	}

	if len(data.Results) == 0 {
		fmt.Println("No movie found")
		return ""
	}

	movie := model.MovieImage{
		Title:  data.Results[0].Title,
		Poster: "https://image.tmdb.org/t/p/w500" + data.Results[0].Poster,
	}

	for _, image := range data.Results[0].Images {
		movie.Images = append(movie.Images, "https://image.tmdb.org/t/p/original"+image.FilePath)
	}
	fmt.Println("Title: ", movie.Title)
	fmt.Println("Poster: ", movie.Poster)
	fmt.Println("Images: ", movie.Images)
	return movie.Poster
}
