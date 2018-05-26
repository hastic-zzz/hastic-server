# Anomaly hooks

- HASTIC_ALERT_ENDPOINT - (optional) endpoint you want to send alerts to

Alert example (method: POST):

```
{
  anomaly: 'cpu_load',
  status: <str>
}
```

`status` field can be one of:
- `alert`
- `OK`

# Docker run
```
docker run -d --name hastic-server -p 80:8000 -e HASTIC_API_KEY=<your_grafana_api_key> HASTIC_ALERT_ENDPOINT="http://exam.ple" hastic-server
```

# Node run

Add variable before launch node.js server
```
$ export HASTIC_ALERT_ENDPOINT=http://alert.example.com
$ cd hastic-server/server
$ npm start
```


