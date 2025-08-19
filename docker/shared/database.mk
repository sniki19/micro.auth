VOLUME_NAME := runesteel_overlord_si1
DATABASE_NAME := db_runesteel_overlord

vol.create:
	@if ! docker volume inspect $(VOLUME_NAME) >/dev/null 2>&1; then \
		docker volume create $(VOLUME_NAME); \
		echo "Volume $(VOLUME_NAME) Created"; \
	else \
		echo "Volume $(VOLUME_NAME) already exists. Doing nothing"; \
	fi
	docker volume ls
vol.remove:
	@if docker volume inspect $(VOLUME_NAME) >/dev/null 2>&1; then \
		docker volume rm $(VOLUME_NAME); \
		echo "Volume $(VOLUME_NAME) Removed"; \
	else \
		echo "Volume $(VOLUME_NAME) does not exist. Nothing to remove"; \
	fi
	docker volume ls

db.up:
	make vol.create
	docker compose up -d $(DATABASE_NAME)
db.down:
	docker compose down $(DATABASE_NAME)
	make vol.remove
db.start:
	docker compose start $(DATABASE_NAME)
db.stop:
	docker compose stop $(DATABASE_NAME)
