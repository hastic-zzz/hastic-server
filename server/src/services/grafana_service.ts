import { Metric } from '../models/metric_model';

import { HASTIC_API_KEY } from '../config';

import { URL } from 'url';
import axios from 'axios';


const CHUNK_SIZE = 50000;

export type Timestamp = number;
/**
 * @param metric to query to Grafana
 * @returns [time, value][] array
 */
export async function queryByMetric(metric: Metric, panelUrl: string): Promise<[number, number][]> {
  let datasource = metric.datasource;

  if (datasource.type !== 'influxdb') {
    throw new Error(`${datasource.type} queries are not supported yet`);
  }

  let origin = new URL(panelUrl).origin;
  let url = `${origin}/${datasource.url}`;

  let params = datasource.params
  let records = await getRecordsCount(url, params);

  let limit = Math.min(records, CHUNK_SIZE);
  let offset = 0;

  let data = [];
  while (offset <= records) {
    let paramsClone = Object.assign({}, params);
    paramsClone.q = paramsClone.q.replace(/(WHERE time >[^A-Z]+)/, `LIMIT ${limit} OFFSET ${offset}`);

    let chunk = await queryGrafana(url, paramsClone);
    data = data.concat(chunk);

    offset += CHUNK_SIZE;
  }

  return data;
}

async function getRecordsCount(url: string, params: any) {
  let paramsClone = Object.assign({}, params);
  let query = paramsClone.q;

  let field = query.match(/"(\w+)"\)*\sFROM/)[1];
  let measurement = query.match(/FROM\s"(\w+)"/)[1];
  paramsClone.q = `SELECT COUNT(${field}) FROM ${measurement}`;
  let result = await queryGrafana(url, paramsClone);
  return result[0][1];
}

async function queryGrafana(url: string, params: any) {
  let headers = { Authorization: `Bearer ${HASTIC_API_KEY}` };

  let res;
  try {
    res = await axios.get(url, { params, headers });
  } catch (e) {
    console.error(`Error while getting data from Grafana: ${e}`);
  }

  if (res.data.results === undefined) {
    throw new Error('results field is undefined in response');
  }

  // TODO: support more than 1 metric (each res.data.results item is a metric)
  let results = res.data.results[0];
  if (results.series === undefined) {
    return [];
  }

  return results.series[0].values;
}
