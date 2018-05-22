# Hastic server

Implementation of basic pattern recognition and unsupervised learning for anomaly detection.

Implementation of analytic unit for Hastic. 
see [REST API](REST.md)

## Build & run

### Docker

Example running hastic-server in Docker:

```
docker build -t hastic-server .
docker run -d --name hastic-server -p 80:8000 -e API_KEY=<your_grafana_api_key> hastic-server
```
