.PHONY: server analytics compose

all: server analytics

server:
	 docker build server -t hastic-server

analytics:
	 docker build analytics -t hastic-analytics

compose:
	 docker-compose up
