include .env.production

COMPOSE_FILE := docker-compose.yaml
ENV_FILE := .env.production
DC := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

CONTAINER_NAME = ${DOCKER_APP_CONTAINER}

app.build:
	@echo Build Docker image...
	$(DC) build $(CONTAINER_NAME)
	docker image ls
app.remove:
	@echo Remove Docker image...
	$(DC) down --rmi local
	docker image ls
app.up:
	@echo Up Docker container $(CONTAINER_NAME)...
	$(DC) up -d $(CONTAINER_NAME) --build
app.down:
	@echo Down Docker container $(CONTAINER_NAME)...
	$(DC) down $(CONTAINER_NAME)
app.start:
	@echo Starting container $(CONTAINER_NAME) with production env...
	$(DC) start $(CONTAINER_NAME)
app.stop:
	@echo Stopping container ${DOCKER_APP_CONTAINER}...
	$(DC) stop $(CONTAINER_NAME)
