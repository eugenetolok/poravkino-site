package poravkino

import (
	"fmt"
	"image/jpeg"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/esimov/stackblur-go"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/labstack/echo/v4"
	"github.com/nfnt/resize"
)

func postImage(c echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	img, err := jpeg.Decode(src)
	if err != nil {
		fmt.Println(err.Error())
	}
	bluredImg, err := stackblur.Process(img, 35)
	if err != nil {
		log.Println(err)
	}

	// Create the file
	err = os.MkdirAll(filepath.Join(utils.WorkDir(), "dist/uploads/"), os.ModePerm)
	if err != nil {
		log.Println(err)
	}

	name := utils.Sha1()
	out, err := os.Create(filepath.Join(utils.WorkDir(), fmt.Sprintf("dist/uploads/%s.jpg", name)))
	if err != nil {
		log.Println(err)
	}
	defer out.Close()

	// resize to width 1920 using Lanczos resampling
	// and preserve aspect ratio
	m := resize.Resize(1920, 0, img, resize.Lanczos3)

	// write new image to file
	jpeg.Encode(out, m, nil)

	// blured part
	outBlured, err := os.OpenFile(filepath.Join(utils.WorkDir(), "dist/uploads/"+"blured_"+name+".jpg"), os.O_WRONLY|os.O_CREATE, 0777)
	if err != nil {
		log.Println(err)
	}
	// resize to width 1000 using Lanczos resampling
	// and preserve aspect ratio
	mBlured := resize.Resize(1920, 0, bluredImg, resize.Lanczos3)

	// write new image to file
	jpeg.Encode(outBlured, mBlured, nil)

	return c.String(http.StatusOK, fmt.Sprintf(`{"url": "/uploads/%s.jpg"}`, name))
}
