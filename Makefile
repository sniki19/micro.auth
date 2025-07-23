include .env.production

include network.mk
include database.mk
include db-viewer.mk
include app.mk

echo:
	@echo App: "${APP_NAME}" v.${APP_VERSION}
