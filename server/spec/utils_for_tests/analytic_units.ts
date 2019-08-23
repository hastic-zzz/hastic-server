import * as AnalyticUnit from '../../src/models/analytic_units';

import { Metric } from 'grafana-datasource-kit';

import * as _ from 'lodash';


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

export async function getAnalyticUnitFromDb(analyticUnitId?: string) {
  const analyticUnitObject = AnalyticUnitObject.getAnalyticUnitObject(analyticUnitId);
  const unit = AnalyticUnit.createAnalyticUnitFromObject(analyticUnitObject);
  const id = await AnalyticUnit.create(unit);
  return { id, unit };
}

export class AnalyticUnitObject {

  private _id: string = null;
  constructor(
    id?: string,
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
  ){
    if(id === undefined) {
      this._id = Math.random().toString(36).substring(2, 15); //random string
    } else {
      this._id = id;
    }
  };

  static getAnalyticUnitObject(id?: string): AnalyticUnitObject {
    let obj = new AnalyticUnitObject(id);
    return obj;
  }
}
