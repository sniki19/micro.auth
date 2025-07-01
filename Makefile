include .env.production

echo:
	@echo App: "${APP_NAME}" v.${APP_VERSION}

COMPOSE_FILE := docker-compose.yaml
ENV_FILE := .env.production
DC := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

net.create:
	docker network create --driver bridge ${DOCKER_NETWORK}
	docker network ls
net.remove:
	docker network rm ${DOCKER_NETWORK}
	docker network ls

vol.create:
	docker volume create ${DOCKER_DB_VOLUME}
	docker volume ls
vol.remove:
	docker volume rm ${DOCKER_DB_VOLUME}
	docker volume ls

up.db:
	$(DC) up -d ${DOCKER_DB_CONTAINER}
down.db:
	$(DC) down ${DOCKER_DB_CONTAINER}
start.db:
	$(DC) start ${DOCKER_DB_CONTAINER}
stop.db:
	$(DC) stop ${DOCKER_DB_CONTAINER}

up.env:
	make up.db
down.env:
	make down.db
start.env:
	make start.db
stop.env:
	make stop.db

build.app:
	@echo Build Docker image...
	$(DC) build ${DOCKER_APP_CONTAINER}
	docker image ls
remove.app:
	@echo Remove Docker image...
	$(DC) down --rmi local
	docker image ls
up.app:
	@echo Up Docker container ${DOCKER_APP_CONTAINER}...
	$(DC) up -d ${DOCKER_APP_CONTAINER}
down.app:
	@echo Down Docker container ${DOCKER_APP_CONTAINER}...
	$(DC) down ${DOCKER_APP_CONTAINER}
start.app:
	@echo Starting container ${DOCKER_APP_CONTAINER} with production env...
	$(DC) start ${DOCKER_APP_CONTAINER}
stop.app:
	@echo Stopping container ${DOCKER_APP_CONTAINER}...
	$(DC) stop ${DOCKER_APP_CONTAINER}

build:
	make build.app
	docker image ls
remove:
	make remove.app
	docker image ls
up:
	make up.env
	make build.app
	make up.app
	docker ps -a
	@echo ${DOCKER_APP_CONTAINER} deployed!
down:
	make down.app
	make remove.app
	make down.env
	docker ps -a
start:
	make start.env
	make start.app
stop:
	make stop.app
	make stop.env
