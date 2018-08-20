import { Metric } from '../models/metric_model';

import { HASTIC_API_KEY } from '../config';

import axios from 'axios';
 

export type Timestamp = number;
/**
 * @param metric to query to Grafana
 * @returns [time, value][] array
 */
export async function queryByMetric(metric: Metric): Promise<[number, number][]> {
  var params = {} + '';
  let headers = { 'Authorization': 'Bearer ' + HASTIC_API_KEY };
  let url = metric.datasource['origin'] + '/' +
            metric.datasource['url'] + '?' +
            encodeURIComponent(params);
  var res = await axios.get(url, { headers });
  let results = res.data['results'];
  if(results === undefined) {
    throw new Error('reuslts field is undefined in response');
  }
  if(results.series === undefined) {
    return [];
  }
  return res['series'][0];
}
