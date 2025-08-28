include .env


.PHONY: app.help app.volume.ls app.volume.create app.volume.remove app.up app.down app.start app.stop app.logs app.ps

app.help:
	@echo "Available commands:"
	@echo "  app.help          - Show help"
	@echo "  app.volume.ls     - List volumes"
	@echo "  app.volume.create - Create volume"
	@echo "  app.volume.remove - Remove volume"
	@echo "  app.up            - Start database container"
	@echo "  app.down          - Stop and remove container"
	@echo "  app.start         - Start stopped container"
	@echo "  app.stop          - Stop container"
	@echo "  app.logs          - View container logs"
	@echo "  app.ps            - Container status"


app.volume.ls:
	@echo "List of volumes:"
	docker volume ls | grep -E "(${MICROSERVICE_LOGS_VOLUME_NAME}|NAME)"

app.volume.create:
	@if ! docker volume inspect ${MICROSERVICE_LOGS_VOLUME_NAME} >/dev/null 2>&1; then \
		echo "Creating volume ${MICROSERVICE_LOGS_VOLUME_NAME}..."; \
		docker volume create ${MICROSERVICE_LOGS_VOLUME_NAME}; \
		echo "Volume ${MICROSERVICE_LOGS_VOLUME_NAME} Created"; \
	else \
		echo "Volume ${MICROSERVICE_LOGS_VOLUME_NAME} already exists. Doing nothing"; \
	fi
	make app.volume.ls

app.volume.remove:
	@if docker volume inspect ${MICROSERVICE_LOGS_VOLUME_NAME} >/dev/null 2>&1; then \
		echo "Removing volume ${MICROSERVICE_LOGS_VOLUME_NAME}..."; \
		docker volume rm ${MICROSERVICE_LOGS_VOLUME_NAME}; \
		echo "Volume ${MICROSERVICE_LOGS_VOLUME_NAME} Removed"; \
	else \
		echo "Volume ${MICROSERVICE_LOGS_VOLUME_NAME} does not exist. Nothing to remove"; \
	fi
	make app.volume.ls

app.build:
	docker compose build microservice
	docker image ls

app.remove:
	docker compose down --rmi local
	docker image ls

app.up:
	make app.volume.create
	@echo "Starting app container..."
	docker compose up -d microservice --build
	@echo "Container started!"
	@echo "Access: http://${API_HOST}:${API_PORT}"

app.down:
	@echo "Stopping and removing container..."
	docker compose down microservice
	@echo "Container stopped and removed!"
	make app.volume.remove

app.start:
	@echo "Starting container..."
	docker compose start microservice
	@echo "Container started!"

app.stop:
	@echo "Stopping container..."
	docker compose stop microservice
	@echo "Container stopped!"

app.logs:
	@echo "Viewing container logs..."
	docker compose logs -f microservice

app.ps:
	@echo "Container status:"
	docker compose ps microservice
