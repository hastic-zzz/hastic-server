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
* [Installation from source](https://github.com/hastic/hastic-server/wiki/Installation-from-source)
* [ChangeLog](https://github.com/hastic/hastic-server/wiki/Change-log)

## Download & Install on Linux

You need only [nodejs >= 6.14](https://nodejs.org/en/download/) on your machine.

### Node 6
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.2-alpha/hastic-server-0.2.2-alpha-node-6.tar.gz
tar -zxvf hastic-server-0.2.2-alpha-node-6.tar.gz
cd hastic-server-0.2.2-alpha/server/dist
node server
```

### Node 8
```
wget https://github.com/hastic/hastic-server/releases/download/0.2.2-alpha/hastic-server-0.2.2-alpha-node-8.tar.gz
tar -zxvf hastic-server-0.2.2-alpha-node-8.tar.gz
cd hastic-server-0.2.2-alpha/server/dist
node server
```


**Make sure that HASTIC_PORT is opened in your firewall. Default value is 8000.**


