.PHONY: server analytics

server:
	 docker build . -f Dockerfile_server

analytics:
	 docker build . -f Dockerfile_analytics

all: server analytics
