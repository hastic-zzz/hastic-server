# Hastic server

Implementation of basic pattern recognition and unsupervised learning for anomaly detection.

Implementation of analytic unit for Hastic. 
see [REST API](REST.md)

## Build & run

### Docker

First of all, you should generate [API key](http://docs.grafana.org/tutorials/api_org_token_howto/) in your Grafana instance.

Without API key hastic-server will not be able to use your datasources.

Example of running hastic-server in Docker:

```
docker build -t hastic-server .
docker run -d --name hastic-server -p 80:8000 -e API_KEY=<your_grafana_api_key> hastic-server
```
