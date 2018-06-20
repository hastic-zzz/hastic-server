[Hastic server](https://hastic.io) [![Travis CI](https://travis-ci.org/hastic/hastic-server.svg?branch=master)](https://travis-ci.org/hastic/hastic-server) 
================
[Website](https://hastic.io) |
[Twitter](https://twitter.com/hasticio)

Implementation of basic pattern recognition for anomaly detection.

Implementation of analytics unit for Hastic.

**Please note that we are still in alpha, so features are subject to change**

See also:
* [Hooks](https://github.com/hastic/hastic-server/blob/master/HOOKS.md) - notifications about events
* [REST](REST.md) - for developing your plugins
* [HasticPanel](https://github.com/hastic/hastic-grafana-graph-panel) - Hastic visualisation plugin for Grafana

## Download & Install on Linux

You need only [nodejs >= 6.14](https://nodejs.org/en/download/) on your machine.

```
wget https://github.com/hastic/hastic-server/releases/download/0.1.0-alpha/hastic-server-0.1.0-alpha.tar.gz
tar -zxvf hastic-server-0.1.0-alpha.tar.gz
cd hastic-server-0.1.0-alpha/server/dist
node server
```

## Build & run from source 

Hastic server requires Grafana's API key (http://<your_grafana_url>/org/apikeys) to query data from Grafana datasources.
API key role requires only `Viewer` access. 

Possible to install on:

* [Linux](#linux)
* [Docker](#docker)

### Linux

#### Environment variables

It is possible to export the following environment variables for hastic-server to use:
- HASTIC_API_KEY - (required) API-key of your Grafana instance
- HASTIC_PORT - (optional) port you want to run server on, default: 8000

#### System prerequisites:

* [git](https://git-scm.com/download/linux)
* [nodejs >= 8.x](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions), but there is special build for [nodejs 6.14](server/BUILD_6_14.md)
* [python3](https://www.python.org/downloads/) with pip3

#### Installation
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

- Adding labeled segments while learning is in progress is not supported
- Dataset doesn't update after 1st learning
- Currently only influxDB datasource is supported
