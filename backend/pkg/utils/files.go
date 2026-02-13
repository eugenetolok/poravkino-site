package utils

import (
	"image"
	"image/jpeg"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/esimov/stackblur-go"
	"github.com/nfnt/resize"
)

// WorkDir returns folder where binary file of program is located
func WorkDir() string {
	workDir, _ := filepath.Abs(filepath.Dir(os.Args[0]))
	return workDir
}

// FileNotExist checks if file exists on disk
func FileNotExist(filename string) error {
	if _, err := os.Stat(filename); err == nil {
		return nil
	} else if os.IsNotExist(err) {
		return err
	} else {
		return err
	}
}

const preMessage = "Download image from external source error. "

// DownloadImage will download a url to a local file. It's efficient because it will
// write as it downloads and not load the whole file into memory.
func DownloadImage(url string, width uint) string {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		log.Println(preMessage + err.Error() + " link: " + url)
		return ""
	}
	defer resp.Body.Close()

	// decode jpeg into image.Image
	img, format, err := image.Decode(resp.Body)
	if err != nil {
		log.Println(preMessage + err.Error())
		return ""
	}
	bluredImg, err := stackblur.Process(img, 35)
	if err != nil {
		log.Println(preMessage + err.Error())
		return ""
	}

	if format == "jpeg" {
		serverFileNameHash := Sha1()
		fileName := serverFileNameHash + ".jpg"

		// Create the file
		err = os.MkdirAll(filepath.Join(WorkDir(), "dist/uploads/"), os.ModePerm)
		if err != nil {
			log.Println(preMessage + err.Error())
			return ""
		}

		out, err := os.OpenFile(filepath.Join(WorkDir(), "dist/uploads/"+fileName), os.O_WRONLY|os.O_CREATE, 0777)
		if err != nil {
			log.Println(preMessage + err.Error())
			return ""
		}
		// resize to width 1000 using Lanczos resampling
		// and preserve aspect ratio
		m := resize.Resize(width, 0, img, resize.Lanczos3)

		// write new image to file
		jpeg.Encode(out, m, nil)

		// blured part
		outBlured, err := os.OpenFile(filepath.Join(WorkDir(), "dist/uploads/"+"blured_"+fileName), os.O_WRONLY|os.O_CREATE, 0777)
		if err != nil {
			log.Println(preMessage + err.Error())
			return ""
		}
		// resize to width 1000 using Lanczos resampling
		// and preserve aspect ratio
		mBlured := resize.Resize(width, 0, bluredImg, resize.Lanczos3)

		// write new image to file
		jpeg.Encode(outBlured, mBlured, nil)

		// // Write the body to file
		// _, err = io.Copy(out, resp.Body)
		return "/uploads/" + fileName
	}
	return ""
}
