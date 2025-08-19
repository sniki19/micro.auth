APP_NAME := app_ninja_minotaur

app.build:
	docker compose build $(APP_NAME)
	docker image ls
app.remove:
	docker compose down --rmi local
	docker image ls

app.up:
	docker compose up -d $(APP_NAME) --build
app.down:
	docker compose down $(APP_NAME)
app.start:
	docker compose start $(APP_NAME)
app.stop:
	docker compose stop $(APP_NAME)
