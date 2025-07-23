NETWORK_NAME = ${DOCKER_NETWORK}

net.create:
	docker network create --driver bridge $(NETWORK_NAME)
	docker network ls
net.remove:
	docker network rm $(NETWORK_NAME)
	docker network ls
