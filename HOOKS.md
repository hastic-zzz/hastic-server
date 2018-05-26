# Anomaly hooks

It's possible to get notifications about new anomalies via [WebHooks](https://en.wikipedia.org/wiki/Webhook)

You need to set variable `HASTIC_ALERT_ENDPOINT` with your endpoint and expects `POST` methods 
from hastic-server if format:

```
{
  anomaly: 'cpu_load',
  status: <str>
}
```

`status` field can be one of:
- `alert`
- `OK`

## Docker run
```bash
docker run -d --name hastic-server -p 80:8000 -e HASTIC_API_KEY=<your_grafana_api_key> HASTIC_ALERT_ENDPOINT="http://exam.ple" hastic-server
```

## Node run

Add variable before launch node.js server

```bash
$ export HASTIC_ALERT_ENDPOINT=http://alert.example.com
$ cd hastic-server/server
$ npm start
```


