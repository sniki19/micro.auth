COMPOSE_FILE := docker-compose.yaml
ENV_FILE := .env.production
DC := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

DB_VIEWER_NAME = ${DOCKER_DB_VIEWER}

viewer.up:
	$(DC) up -d $(DB_VIEWER_NAME)
viewer.down:
	$(DC) down $(DB_VIEWER_NAME)
viewer.start:
	$(DC) start $(DB_VIEWER_NAME)
viewer.stop:
	$(DC) stop $(DB_VIEWER_NAME)
