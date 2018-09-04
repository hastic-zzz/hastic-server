<p align="center">
  <a href=#hastic-server->
    <img width="auto" align="middle" height="120px" src="https://github.com/hastic/hastic-server/blob/master/images/hastic_server.png" />
    <img hspace="50" align="middle" width="30%" height="30%" src="https://github.com/hastic/hastic-server/blob/master/images/hastic_logo.png" />
  </a>
</p>

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

### Node 6
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.0-alpha/hastic-server-0.2.0-alpha-node-6.tar.gz
tar -zxvf hastic-server-0.2.0-alpha-node-6.tar.gz
cd hastic-server-0.2.0-alpha/server/dist
node server
```

### Node 8
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.0-alpha/hastic-server-0.2.0-alpha-node-8.tar.gz
tar -zxvf hastic-server-0.2.0-alpha-node-8.tar.gz
cd hastic-server-0.2.0-alpha/server/dist
node server
```

## Build & run from source 

Hastic server requires Grafana's API key (http://<your_grafana_url>/org/apikeys) to query data from Grafana datasources.
API key role requires only `Viewer` access. 

Possible to install on:

* [Linux](#linux)
* [Docker](#docker)

### Linux

#### System prerequisites:

* [git](https://git-scm.com/download/linux)
* [nodejs >= 6.14](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
* [python == 3.6.х](https://www.python.org/downloads/) with [pip3](https://packaging.python.org/guides/installing-using-linux-tools/#installing-pip-setuptools-wheel-with-linux-package-managers)

#### Installation
```bash
git clone https://github.com/hastic/hastic-server.git
cd hastic-server
pip3 install -r analytics/requirements.txt
cd server
npm install
npm run build
```

#### Configuration

You can configure hastic-server using either *environment variables* or *config file*.

> NOTE: environment variables have higher priority than config file.

##### Environment variables
You can export the following environment variables for hastic-server to use:
- HASTIC_API_KEY - (required) API-key of your Grafana instance
- HASTIC_PORT - (optional) port you want to run server on, default: 8000

e.g.
```bash
export HASTIC_API_KEY=eyJrIjoiVjZqMHY0dHk4UEE3eEN4MzgzRnd2aURlMWlIdXdHNW4iLCJuIjoiaGFzdGljIiwiaWQiOjF9
export HASTIC_PORT=8080
```

##### Config file
You can also rename `config.example.json` to `config.json` and set your values there.

#### Run
```bash
cd hastic-server/server
npm start
```

### Docker

#### Fetch image
```bash
docker pull hastic/server
```

#### Run
```bash
docker run -d \
  --name hastic-server \
  --ipc host \
  -p 80:8000 \
  -e HASTIC_API_KEY=<your_grafana_api_key> \
  -v /tmp:/tmp \
  hastic/server
```

### Changelog

### [0.2.0-alpha] - 2018-09-03
> NOTE: hastic-panels of versions older than 0.2.0 are not supported

#### Added
- Return version of server [#66](https://github.com/hastic/hastic-server/issues/66)
- Return analytic status [#71](https://github.com/hastic/hastic-server/issues/71)

#### Fixed
- Case-sensitive anomaly name [#41](https://github.com/hastic/hastic-server/issues/41)
- ImportError: cannot import name 'isna' [#59](https://github.com/hastic/hastic-server/issues/59)
- Handle analytics connection failure on server [#74](https://github.com/hastic/hastic-server/issues/74)
- Analytics wont start in production mode [#77](https://github.com/hastic/hastic-server/issues/77)
- Basic creation of analytic unit fails [#79](https://github.com/hastic/hastic-server/issues/79)
- Missing communication between analytics and server in production [#91](https://github.com/hastic/hastic-server/issues/91) - thx [@petrk94](https://github.com/petrk94) for [bugreport](https://github.com/hastic/hastic-server/issues/90)
- Server is stopping only after second Ctrl-C [#96](https://github.com/hastic/hastic-server/issues/96)
- Error: 'value' [#100](https://github.com/hastic/hastic-server/issues/100)
- Error: Unexpected response [#125](https://github.com/hastic/hastic-server/issues/125)
- Error: max of an empty sequence in peaks model [#126](https://github.com/hastic/hastic-server/issues/126)

### [0.1.4-alpha] - 2018-06-29
#### Changed
- Informative error messages instead of "Internal error" [#40](https://github.com/hastic/hastic-server/issues/33)

#### Fixed
- "No such file or directory" error on anomaly create [#33](https://github.com/hastic/hastic-server/issues/33)
- Case-sensitive anomaly name [#41](https://github.com/hastic/hastic-server/issues/41)

### [0.1.3-alpha] - 2018-06-28
#### Changed
- Drops algorithm improvement.

### [0.1.2-alpha] - 2018-06-25
#### Fixed
- Error: type object 'sklearn.tree...' [#28](https://github.com/hastic/hastic-server/issues/28)

### [0.1.1-alpha] - 2018-06-25
#### Added
- HASTIC_API_KEY to config file [#23](https://github.com/hastic/hastic-server/issues/23)
