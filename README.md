# Hastic server

Implementation of basic pattern recognition and unsupervised learning for anomaly detection.

Implementation of analytic unit for Hastic. 
see [REST API](REST.md)

## Build & run

Server needs Grafana's API key (http://<your_grafana_url>/org/apikeys) to query data from Grafana datasources.

API key role can be any of:
- Viewer
- Editor
- Admin

### Docker installation

Example of running hastic-server in Docker:

```
docker build -t hastic-server .
docker run -d --name hastic-server -p 80:8000 -e HASTIC_API_KEY=<your_grafana_api_key> hastic-server
```

### Linux installation

#### Environment variables

You can export following environment variables for hastic-server to use:
- HASTIC_API_KEY - (required) API-key of your Grafana instance
- HASTIC_PORT - (optional) port you want to run server on, default: 8000

See [hooks docs](https://github.com/hastic/hastic-server/blob/master/HOOKS.md) for notifications about events.

#### Dependencies

- git
- python3 with:
  - pandas
  - seglearn
  - scipy
  - tsfresh
- nodejs >= 9

Example of running hastic-server on Debian / Ubuntu host:

```
$ export HASTIC_API_KEY=<your_grafana_api_key>
$ export HASTIC_PORT=<port_you_want_to_run_server_on>
# sudo apt-get install \
  python3 \
  python3-pip \
  gnupg \
  curl \
  make \
  g++ \
  git
$ sudo pip3 install pandas seglearn scipy tsfresh
$ curl -sL https://deb.nodesource.com/setup_9.x | bash -
# apt-get update && apt-get install -y nodejs
$ git clone https://github.com/hastic/hastic-server.git
$ cd hastic-server/server
$ npm install && npm run build
$ npm start
```
