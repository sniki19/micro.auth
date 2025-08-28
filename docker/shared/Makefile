include .env
include database.mk
include app.mk


help:
	make db.help
	make app.help

network.check:
	@if ! docker network inspect ${APP_NETWORK_NAME} >/dev/null 2>&1; then \
		echo "Network ${APP_NETWORK_NAME} does not exist!"; \
		echo "Create it with: docker network create ${APP_NETWORK_NAME}; \
		exit 1; \
	else \
		echo "Network ${APP_NETWORK_NAME} exists"; \
	fi

status:
	@echo "=== Status ==="
	@echo "Networks:"
	@docker network ls | grep -E "(${APP_NETWORK_NAME}|NAME)" || true
	@echo "Volumes:"
	@docker volume ls | grep -E "(${DATABASE_VOLUME_NAME}|${MICROSERVICE_LOGS_VOLUME_NAME}|NAME)" || true
	@echo "Containers:"
	@docker ps -a | grep -E "($(DATABASE_CONTAINER_NAME)|${MICROSERVICE_CONTAINER_NAME}|NAMES)" || true
