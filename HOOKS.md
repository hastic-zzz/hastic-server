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
