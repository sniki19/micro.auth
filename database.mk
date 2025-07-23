COMPOSE_FILE := docker-compose.yaml
ENV_FILE := .env.production
DC := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

DB_VOLUME = ${DOCKER_DB_VOLUME}
DB_CONTAINER = ${DOCKER_DB_CONTAINER}

vol.create:
	@if ! docker volume inspect $(DB_VOLUME) >/dev/null 2>&1; then \
		docker volume create $(DB_VOLUME); \
		echo "Volume $(DB_VOLUME) Created"; \
	else \
		echo "Volume $(DB_VOLUME) already exists. Doing nothing"; \
	fi
	docker volume ls
vol.remove:
	@if docker volume inspect $(DB_VOLUME) >/dev/null 2>&1; then \
		docker volume rm $(DB_VOLUME); \
		echo "Volume $(DB_VOLUME) Removed"; \
	else \
		echo "Volume $(DB_VOLUME) does not exist. Nothing to remove"; \
	fi
	docker volume ls

db.up:
	make vol.create
	$(DC) up -d $(DB_CONTAINER)
db.down:
	$(DC) down $(DB_CONTAINER)
	make vol.remove
db.start:
	$(DC) start $(DB_CONTAINER)
db.stop:
	$(DC) stop $(DB_CONTAINER)
