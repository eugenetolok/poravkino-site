package poravkino

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"os"
	"strings"

	"github.com/eugenetolok/go-poravkino/pkg/extapi"
	"github.com/eugenetolok/go-poravkino/pkg/model"
	"github.com/eugenetolok/go-poravkino/pkg/smtp"
	"github.com/eugenetolok/go-poravkino/pkg/utils"
	"github.com/eugenetolok/go-poravkino/pkg/yookassa"
	"github.com/manifoldco/promptui"
	"github.com/robfig/cron"
	"gopkg.in/yaml.v3"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db *gorm.DB
	// yaml settings
	appSettings model.AppSettings
	// halls
	halls map[int][]extapi.Place
)

func InitPoravkino(f model.Flags) {
	// flags
	if f.ShowYamlStruct {
		yamlFile, _ := yaml.Marshal(&appSettings)
		fmt.Println(string(yamlFile))
		os.Exit(0)
	}
	// init configs
	updateConfig()
	// init html
	initHTML()
	extapi.InitConfig(appSettings.BookingSettings)
	if len(appSettings.BanksSettings) == 0 {
		os.Exit(1)
	}
	yookassa.InitConfig(appSettings.BanksSettings)
	smtp.InitConfig(appSettings.MailSettings)
	// init db
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		appSettings.SiteSettings.SQLhost,
		appSettings.SiteSettings.SQLuser,
		appSettings.SiteSettings.SQLpassword,
		appSettings.SiteSettings.SQLdbname,
		appSettings.SiteSettings.SQLport)
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("database connection problem")
	}
	if f.DropTable {
		db.Migrator().DropTable(
			model.Movie{},
			model.Performance{},
			model.Sale{},
			model.Notification{},
			model.User{})
		log.Println("All tables are dropped")
		os.Exit(0)
	}
	if f.Migrate {
		db.AutoMigrate(
			model.Movie{},
			model.Performance{},
			model.Sale{},
			model.Notification{},
			model.User{})
		log.Println("All tables are migrated")
		os.Exit(0)
	}
	if f.AddUser {
		var user model.User
		user.Username, user.Password, user.Role = promptUser()
		if err := db.Create(&user).Error; err != nil {
			log.Println("user creation failed", err)
			os.Exit(1)
		}
		os.Exit(0)
	}
	// cron init
	updateSchedule()
	if f.UpdateSchedule {
		os.Exit(0)
	}
	// init halls
	halls = extapi.GetHalls()
	c := cron.New()
	c.AddFunc("@every 600s", updateSchedule)
	c.AddFunc("@every 60s", updateSales)
	c.AddFunc("@every 60s", sendEmails)
	c.AddFunc("@every 300s", clearIPMap)
	// c.AddFunc("@every 20s", fixProblemSales)
	c.AddFunc("@every 10s", updateConfig)
	c.Start()
}

func updateConfig() {
	if !utils.UnmarshalYaml("app.yaml", &appSettings) {
		log.Println("settings invalid")
	}
	extapi.InitConfig(appSettings.BookingSettings)
}

func initHTML() {
	t, err := template.ParseFiles(utils.WorkDir() + "/dist/index.html")
	if err != nil {
		log.Print("index template parsing error: ", err)
	}
	buf := new(bytes.Buffer)
	err = t.Execute(buf, appSettings.CinemaSettings)
	if err != nil { // if there is an error
		log.Print("index template executing error: ", err)
	}
	err = os.WriteFile(utils.WorkDir()+"/dist/index.html", buf.Bytes(), 0644)
	if err != nil {
		log.Print("index template write error: ", err)
	}
}

// Function to prompt user for username and password using promptui
func promptUser() (string, string, string) {
	// Create prompts for username and password
	usernamePrompt := promptui.Prompt{
		Label: "Enter username",
	}

	passwordPrompt := promptui.Prompt{
		Label: "Enter password",
		Mask:  '*',
	}

	rolePrompt := promptui.Select{
		Label: "Select role",
		Items: []string{"admin", "editor"},
	}

	// Prompt user for username
	username, err := usernamePrompt.Run()
	if err != nil {
		fmt.Println("Prompt failed:", err)
		os.Exit(1)
	}

	// Prompt user for password
	password, err := passwordPrompt.Run()
	if err != nil {
		fmt.Println("Prompt failed:", err)
		os.Exit(1)
	}

	// Prompt user for username
	_, role, err := rolePrompt.Run()
	if err != nil {
		fmt.Println("Prompt failed:", err)
		os.Exit(1)
	}

	return strings.TrimSpace(username), strings.TrimSpace(password), strings.TrimSpace(role)
}
