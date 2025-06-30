include .env

echo:
	echo App: "${APP_NAME}" v.${APP_VERSION}

ENV_COMPOSE_FILE := docker-compose.yaml

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
	docker compose -f $(ENV_COMPOSE_FILE) up -d ${DOCKER_DB_CONTAINER}
down.db:
	docker compose -f $(ENV_COMPOSE_FILE) down ${DOCKER_DB_CONTAINER}
start.db:
	docker compose -f $(ENV_COMPOSE_FILE) start ${DOCKER_DB_CONTAINER}
stop.db:
	docker compose -f $(ENV_COMPOSE_FILE) stop ${DOCKER_DB_CONTAINER}

up.env:
	make up.db
down.env:
	make down.db
start.env:
	make start.db
stop.env:
	make stop.db

up:
	make up.env
	docker ps -a
down:
	make down.env
	docker ps -a
start:
	make start.env
stop:
	make stop.env
