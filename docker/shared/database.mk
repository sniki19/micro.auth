include .env


.PHONY: db.help db.volume.ls db.volume.create db.volume.remove db.up db.down db.start db.stop db.logs db.ps

db.help:
	@echo "Available commands:"
	@echo "  db.help          - Show help"
	@echo "  db.volume.ls     - List volumes"
	@echo "  db.volume.create - Create volume"
	@echo "  db.volume.remove - Remove volume"
	@echo "  db.up            - Start database container"
	@echo "  db.down          - Stop and remove container"
	@echo "  db.start         - Start stopped container"
	@echo "  db.stop          - Stop container"
	@echo "  db.logs          - View container logs"
	@echo "  db.ps            - Container status"


db.volume.ls:
	@echo "List of volumes:"
	docker volume ls | grep -E "(${DATABASE_VOLUME_NAME}|NAME)"

db.volume.create:
	@if ! docker volume inspect ${DATABASE_VOLUME_NAME} >/dev/null 2>&1; then \
		echo "Creating volume ${DATABASE_VOLUME_NAME}..."; \
		docker volume create ${DATABASE_VOLUME_NAME}; \
		echo "Volume ${DATABASE_VOLUME_NAME} Created"; \
	else \
		echo "Volume ${DATABASE_VOLUME_NAME} already exists. Doing nothing"; \
	fi
	make db.volume.ls

db.volume.remove:
	@if docker volume inspect ${DATABASE_VOLUME_NAME} >/dev/null 2>&1; then \
		echo "Removing volume ${DATABASE_VOLUME_NAME}..."; \
		docker volume rm ${DATABASE_VOLUME_NAME}; \
		echo "Volume ${DATABASE_VOLUME_NAME} Removed"; \
	else \
		echo "Volume ${DATABASE_VOLUME_NAME} does not exist. Nothing to remove"; \
	fi
	make db.volume.ls

db.up:
	make db.volume.create
	@echo "Starting database container..."
	docker compose up -d database
	@echo "Container started!"
	@echo "Access: http://${DATABASE_HOST}:${DATABASE_PORT}"

db.down:
	@echo "Stopping and removing container..."
	docker compose down database
	@echo "Container stopped and removed!"
	make db.volume.remove

db.start:
	@echo "Starting container..."
	docker compose start database
	@echo "Container started!"

db.stop:
	@echo "Stopping container..."
	docker compose stop database
	@echo "Container stopped!"

db.logs:
	@echo "Viewing container logs..."
	docker compose logs -f database

db.ps:
	@echo "Container status:"
	docker compose ps database
