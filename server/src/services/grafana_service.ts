import { Metric } from '../models/metric_model';

import { HASTIC_API_KEY } from '../config';

import { URL } from 'url';
import { stringify } from 'querystring';
import axios from 'axios';
 

export type Timestamp = number;
/**
 * @param metric to query to Grafana
 * @returns [time, value][] array
 */
export async function queryByMetric(metric: Metric, panelUrl: string): Promise<[number, number][]> {
  let datasource = metric.datasource;

  if(datasource.type !== 'influxdb') {
    throw new Error(`${datasource.type} queries are not supported yet`);
  }
  var params = {};
  let origin = new URL(panelUrl).origin;
  let url = `${origin}/${datasource.url}?${stringify(params)}`;
  console.log(url)

  let headers = { 'Authorization': 'Bearer ' + HASTIC_API_KEY };

  let res = await axios.get(url, { headers });

  let results = res.data['results'];
  console.log(results)
  if(results === undefined) {
    throw new Error('reuslts field is undefined in response');
  }
  if(results.series === undefined) {
    return [];
  }
  return res['series'][0];
}
