# Hastic server REST API

## /anomalies

### Get anomalies
`GET /anomalies?id=<anomaly_id>[&name=<anomaly_name>]`

NOTE: `name` param is deprecated, use `id` instead

Return data format:

```
{
  "name": "<anomaly_name>",
  "metric": "<metric_id>",
  "status": "<str>"
}
```

status field can be one of:

- `learning`
- `ready`
- `failed`

### Get anomaly status
`GET /anomalies/status?id=<anomaly_id>[&name=<anomaly_name>]`

NOTE: `name` param is deprecated, use `id` instead

Return data format:

```
{
  "status": <str>,
  "errorMessage": <str>
}
```

status field can be one of:

- `learning`
- `ready`
- `failed`

### Add anomaly

`POST /anomalies`

Data format:

```
{
  "name": "cpu_utilization_supervised",
  "metric": {
    "datasource": "influx accelerometer",
    "targets": [
      <targets>
    ]
  },
  "panelUrl": "http://grafana.example.com/d/oNZ35bWiz/new-dashboard-copy?panelId=2&fullscreen",
  "datasource": {
    "data": null,
    "type": "influxdb",
    "method": "GET",
    "params": {
      "db": "collectd",
      "q": "SELECT mean("value") FROM "cpu_value" WHERE ("type_instance" = 'user') AND time >= 1525603866633ms and time <= 1526986266633ms GROUP BY time(10s)",
      "epoch": "ms"
    }
    "url": "api/datasources/proxy/8/query"
  }
}
```

`targets` example:

```
{
  "alias": "command",
  "groupBy": [],
  "measurement": "data",
  "orderByTime": "ASC",
  "policy": "default",
  "refId": "A",
  "resultFormat": "time_series",
  "select": [
    [
      {
        "params": [
          "command"
        ],
        "type": "field"
      }
    ]
  ],
  "tags": []
}
```

Return data format:

```
{
  "anomaly_id": "<anomaly_id>"
}
```

### Delete anpmalies
`DELETE /anomalies`

Data format:

```
{
  "id": "<anomaly_id>",
  "name": "<anomaly_name>" // deprecated, use id instead
}
```

Return data format:

```
Success
```

## /segments

### Get segments
`GET /segments?anomaly_id=<anomaly_id>[&last_segment=<id>][&from=<time_from>][&to=<time_to>]`

Return data format:

```
{
  "segments": [
    {
      "id": 0,
      "start": 1392765184318,
      "finish": 1397243699000,
      "labeled": true
    },
    ...
  ]
}
```

### Update segments

`PATCH /segments`

Data format:

```
{
  "anomaly_id": "<anomaly_id>",
  "name": "<anomaly_name>", // deprecated, use id instead
  "added_segments": [
    {
      "start": 1397164656000,
      "finish": 1397243699000
    },
    ...
  ],
  "removed_segments": [3, 9]
}
```

Return data format:

```
{
  "added_ids": [12, ...]
}
```

## /alerts

### Check if alert is enabled for anomaly

`GET /alerts?anomaly_id=<anomaly_id>`

Return data format:

```
{
  "enable": true
}
```

### Enable / disable alert for anomaly

`POST /alerts`

Data format:

```
{
  "anomaly_id": "<anomaly_id>",
  "enable": true
}
```

Return data format:

```
{
  "status": "Ok"
}
```
