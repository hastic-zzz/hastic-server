import * as AnalyticUnit from '../../src/models/analytic_units';

import { Metric } from 'grafana-datasource-kit';

import * as _ from 'lodash';
import * as AnalyticUnitCache from '../../src/models/analytic_unit_cache_model';


export const TEST_ANALYTIC_UNIT_ID: AnalyticUnit.AnalyticUnitId = 'testid';

const DEFAULT_DATASOURCE_STRUCTURE = {
  url: "api/datasources/proxy/5/query",
  data: null,
  params: {
    db:"dbname",
    q: "SELECT mean(\"value\") FROM \"autogen\".\"tcpconns_value\" WHERE time >= now() - 6h GROUP BY time(20s) fill(null)",
    epoch: "ms"
  },
  type: "influxdb"
};

const DEFAULT_TARGETS_STRUCTURE = [
  {
    groupBy: [
      {
        params: ["$__interval"],
        type: "time"
      },
      {
        params: ["null"],
        type: "fill"
      }
    ],
    measurement: "tcpconns_value",
    orderByTime: "ASC",
    policy: "autogen",
    refId: "A",
    resultFormat: "time_series",
    select: [[{"params":["value"],"type":"field"},{"params":[],"type":"mean"}]],"tags":[]
  }
];

const DEFAULT_METRIC = new Metric(
  DEFAULT_DATASOURCE_STRUCTURE,
  DEFAULT_TARGETS_STRUCTURE
);

export async function getAnalyticUnitFromDb() {
  const analyticUnitObject = AnalyticUnitObject.getAnalyticUnitObject();
  const unit = AnalyticUnit.createAnalyticUnitFromObject(analyticUnitObject);
  const id = await AnalyticUnit.create(unit);
  return { id, unit };
}

export async function clearAnalyticUnitDb() {
  await AnalyticUnit.remove(TEST_ANALYTIC_UNIT_ID);
  await AnalyticUnitCache.remove(TEST_ANALYTIC_UNIT_ID);
}

export class AnalyticUnitObject {

  private _id = TEST_ANALYTIC_UNIT_ID;

  constructor(
    public name: string = 'name',
    public grafanaUrl: string = 'grafanaUrl',
    public panelId: string = 'panelId',
    public type: string = 'type',
    public metric: Metric = DEFAULT_METRIC,
    public alert: boolean = false,
    public labeledColor: string = '#FF99FF',
    public deletedColor: string = '#00f0ff',
    public detectorType: AnalyticUnit.DetectorType = AnalyticUnit.DetectorType.ANOMALY,
    public visible: boolean = true,
    public collapsed: boolean = false
  ){};

  static getAnalyticUnitObject(): AnalyticUnitObject {
    return new AnalyticUnitObject();
  }
}
