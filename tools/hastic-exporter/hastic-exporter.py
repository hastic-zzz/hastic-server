#!/usr/bin/env python3
from prometheus_client import start_http_server, Metric, REGISTRY
import json
import requests
import sys
import time
import dateutil.parser as dt

class JsonCollector(object):

  def __init__(self, endpoint):
    self._endpoint = endpoint

  def collect(self):

    response = None
    try:
        resp = requests.get(self._endpoint).content.decode('UTF-8')
        response = json.loads(resp)
    except Exception as e:
        print('got exception, skip polling loop {}'.format(e))
        return
    
    commitHash = response.get('git', {}).get('commitHash')
    packageVersion = response.get('packageVersion')

    metrics = {
        'activeWebhooks': response.get('activeWebhooks'),
        'ready': int(response.get('analytics', {}).get('ready', 0)),
        'tasksQueueLength': response.get('analytics', {}).get('tasksQueueLength'),
        'awaitedTasksNumber': response.get('awaitedTasksNumber'),
        'detectionsCount': response.get('detectionsCount')
    }

    for name, value in metrics.items():
        if value is not None:
            metric = Metric(name, name, 'gauge')
            metric.add_sample(name, value=value, labels={'commitHash': commitHash, 'packageVersion': packageVersion})
            yield metric
        else:
            print('{} value is {}, skip metric'.format(name, value))

    lastAlive = response.get('analytics', {}).get('lastAlive')
    if lastAlive:
        lastAlive = int(dt.parse(lastAlive).timestamp()) * 1000 #ms
        metric = Metric('lastAlive', 'lastAlive', 'gauge')
        metric.add_sample('lastAlive', value=lastAlive, labels={'commitHash': commitHash, 'packageVersion': packageVersion})
        yield metric

    timestamp = response.get('timestamp')
    if timestamp:
        timestamp = int(dt.parse(timestamp).timestamp()) * 1000 #ms
        metric = Metric('timestamp', 'timestamp', 'gauge')
        metric.add_sample('timestamp', value=timestamp, labels={'commitHash': commitHash, 'packageVersion': packageVersion})
        yield metric


if __name__ == '__main__':
  hastic_url = sys.argv[1]
  exporter_port = int(sys.argv[2])

  start_http_server(exporter_port)
  REGISTRY.register(JsonCollector(hastic_url))

  while True: time.sleep(1)
