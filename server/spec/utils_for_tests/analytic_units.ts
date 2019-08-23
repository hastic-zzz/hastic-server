import * as AnalyticUnit from '../../src/models/analytic_units';

import { Metric } from 'grafana-datasource-kit';

import * as _ from 'lodash';


export const TEST_ANALYTIC_UNIT_ID: AnalyticUnit.AnalyticUnitId = 'testid';

export async function createAnalyticUnit(detectorType = AnalyticUnit.DetectorType.ANOMALY) {
  const analyticUnitObject = AnalyticUnitObject.getAnalyticUnitObject(detectorType);
  const unit = AnalyticUnit.createAnalyticUnitFromObject(analyticUnitObject);
  const id = await AnalyticUnit.create(unit);
  return { id, unit };
}

export class AnalyticUnitObject {

  constructor(
    private _id: string = null,
    public name: string = 'name',
    public grafanaUrl: string = 'grafanaUrl',
    public panelId: string = 'panelId',
    public type: string = 'type',
    public metric: Metric = new Metric(
      {
        url: "api/datasources/proxy/5/query",
        data: null,
        params: {
          db:"dbname",
          q: "SELECT mean(\"value\") FROM \"autogen\".\"tcpconns_value\" WHERE time >= now() - 6h GROUP BY time(20s) fill(null)",
          epoch: "ms"
        },
        type: "influxdb"
      },
      [
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
      ]
    ),
    public alert: boolean = false,
    public labeledColor: string = '#FF99FF',
    public deletedColor: string = '#00f0ff',
    public detectorType: AnalyticUnit.DetectorType = AnalyticUnit.DetectorType.ANOMALY,
    public visible: boolean = true,
    public collapsed: boolean = false
  ){
    if(this._id === null) {
      this._id = Math.random().toString(36).substring(2, 15); //random string
    }
  };

  static getAnalyticUnitObject(detectorType: AnalyticUnit.DetectorType): AnalyticUnitObject {
    let obj = new AnalyticUnitObject();
    obj.detectorType = detectorType;
    return obj;
  }
}
