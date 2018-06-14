[Hastic server](https://hastic.io) [![Travis CI](https://travis-ci.org/hastic/hastic-server.svg?branch=master)](https://travis-ci.org/hastic/hastic-server) 
================
[Website](https://hastic.io) |
[Twitter](https://twitter.com/hasticio)

Implementation of basic pattern recognition for anomaly detection.

Implementation of analytic unit for Hastic.

See also:
* [Hooks](https://github.com/hastic/hastic-server/blob/master/HOOKS.md) - notifications about events
* [REST](REST.md) - for developing your plugins
* [HasticPanel](https://github.com/hastic/hastic-grafana-graph-panel) - Hastic visualisation plugin for Grafana 

## Build & run

Server needs Grafana's API key (http://<your_grafana_url>/org/apikeys) to query data from Grafana datasources.
API key role needs only `Viewer` access. 

You can install it on:

* [Linux](#linux)
* [Docker](#docker)

### Linux

#### Environment variables

You can export following environment variables for hastic-server to use:
- HASTIC_API_KEY - (required) API-key of your Grafana instance
- HASTIC_PORT - (optional) port you want to run server on, default: 8000

#### Dependencies

You need in your system:
* [git](https://git-scm.com/download/linux)
* [nodejs >= 6.0.0](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
* [python3](https://www.python.org/downloads/) with pip3

#### Intallation
```bash
pip3 install pandas seglearn scipy tsfresh

git clone https://github.com/hastic/hastic-server.git
cd ./hastic-server/server
npm install 
npm run build
```

#### Run
```bash
export HASTIC_API_KEY=<your_grafana_api_key>
export HASTIC_PORT=<port_you_want_to_run_server_on>

cd ./hastic-server/server
npm start
```

### Docker

Example of running hastic-server in Docker:

#### Build 
```bash
git clone https://github.com/hastic/hastic-server.git
cd hastic-server
docker build -t hastic-server .
```

#### Run
```bash
docker run -d --name hastic-server -p 80:8000 -e HASTIC_API_KEY=<your_grafana_api_key> hastic-server
```

### Known bugs & issues

- If you add labeled segments while learning - it fails
- Dataset doesn't get updated after 1st learning
- Currently only influxDB datasource is supported
