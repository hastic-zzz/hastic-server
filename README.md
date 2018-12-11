<p align="center">
  <a href=#hastic-server->
    <img width="auto" align="middle" height="120px" src="https://github.com/hastic/hastic-server/blob/master/images/hastic_server.png" />
    <img hspace="50" align="middle" width="30%" height="30%" src="https://github.com/hastic/hastic-server/blob/master/images/hastic_logo.png" />
  </a>
</p>

[Hastic server](https://hastic.io)
================
[Website](https://hastic.io) |
[Twitter](https://twitter.com/hasticio) | 
[IRC](https://webchat.freenode.net/?channels=#hastic)

![Last master push status](https://travis-ci.org/hastic/hastic-server.svg?branch=master)

Implementation of basic pattern recognition for anomaly detection.

Implementation of analytics unit for Hastic.

**Please note that we are still in alpha, so features are subject to change**

See also:
* [Getting started](https://github.com/hastic/hastic-server/wiki#getting-started)
* [FAQ](https://github.com/hastic/hastic-server/wiki/FAQ)
* [HasticPanel](https://github.com/hastic/hastic-grafana-graph-panel) - Hastic visualisation plugin for Grafana
* [Webhooks](https://github.com/hastic/hastic-server/wiki/Webhooks) - notifications about events
* [Installation from source](https://github.com/hastic/hastic-server/wiki/Installation-from-source)
* [ChangeLog](https://github.com/hastic/hastic-server/wiki/Changelog)
* [Roadmap](https://github.com/hastic/hastic-server/wiki/Roadmap)

## Download & Install on Linux

You need only [nodejs >= 6.14](https://nodejs.org/en/download/) on your machine.

### Node 6
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.6-alpha/hastic-server-0.2.6-alpha-node-6.tar.gz
tar -zxvf hastic-server-0.2.6-alpha-node-6.tar.gz
cd hastic-server-0.2.6-alpha/server/dist
node server
```

### Node 8
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.6-alpha/hastic-server-0.2.6-alpha-node-8.tar.gz
tar -zxvf hastic-server-0.2.6-alpha-node-8.tar.gz
cd hastic-server-0.2.6-alpha/server/dist
node server
```

**Make sure that HASTIC_PORT is opened in your firewall. Default value is 8000.**

## [Docker installation](https://github.com/hastic/hastic-server/wiki/Docker)

