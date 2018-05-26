# Hastic server

Implementation of basic pattern recognition and unsupervised learning for anomaly detection.

Implementation of analytic unit for Hastic. 

See also:
* [Hooks](https://github.com/hastic/hastic-server/blob/master/HOOKS.md) - notifications about events
* [REST](REST.md) - developing your plugins
* [HasticPanel][https://github.com/hastic/hastic-grafana-graph-panel] - Hastic plugin for Grafana 

## Build & run

Server needs Grafana's API key (http://<your_grafana_url>/org/apikeys) to query data from Grafana datasources.
API key role needs only `Viewer` access.

### Docker installation

Example of running hastic-server in Docker:

```bash
docker build -t hastic-server .
docker run -d --name hastic-server -p 80:8000 -e HASTIC_API_KEY=<your_grafana_api_key> hastic-server
```

### Linux installation

#### Environment variables

You can export following environment variables for hastic-server to use:
- HASTIC_API_KEY - (required) API-key of your Grafana instance
- HASTIC_PORT - (optional) port you want to run server on, default: 8000

#### Dependencies

You need in your system:
* [nodejs >= 6.0.0](https://nodejs.org/en/download/package-manager/)
* [python3 python3-pip](https://www.python.org/downloads/)
* curl gnupg git make g++


Example of running hastic-server on Debian / Ubuntu host:

```bash
$ pip3 install pandas seglearn scipy tsfresh
$ export HASTIC_API_KEY=<your_grafana_api_key>
$ export HASTIC_PORT=<port_you_want_to_run_server_on>

$ git clone https://github.com/hastic/hastic-server.git
$ cd hastic-server/server
$ npm install && npm run build
$ npm start
```
