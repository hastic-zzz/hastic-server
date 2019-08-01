import { queryByMetric } from 'grafana-datasource-kit';

jest.mock('grafana-datasource-kit', () => (
  {
    ...(jest.requireActual('grafana-datasource-kit')),
    queryByMetric: jest.fn((metric, url, from, to, apiKey) => {})
  }
));

import { saveAnalyticUnitFromObject, runDetect } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_units';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';

import { HASTIC_API_KEY } from '../src/config';


describe('Check detection range', function() {
  const analyticUnitObj = {
    _id: 'test',
    name: "test",
    grafanaUrl: "http://127.0.0.1:3000",
    panelId: "ZLc0KfNZk/2",
    type: "GENERAL",
    metric: {
      datasource: {
        url: "api/datasources/proxy/5/query",
        method: "GET",
        data: null,
        params: {
          db:"dbname",
          q: "SELECT mean(\"value\") FROM \"autogen\".\"tcpconns_value\" WHERE time >= now() - 6h GROUP BY time(20s) fill(null)",
          epoch: "ms"
        },
        type: "influxdb"
      },
      targets: [
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
    },
    alert: false,
    labeledColor: "#FF99FF",
    deletedColor: "#00f0ff",
    detectorType: "pattern",
    visible: true,
    collapsed: false,
    createdAt: {"$$date":1564476040880},
    updatedAt: {"$$date":1564476040880}
  }

  const WINDOW_SIZE = 10;
  const TIME_STEP = 1000;

  async function addTestUnitToDB(): Promise<string> {
    const analyticUnitId = await saveAnalyticUnitFromObject(analyticUnitObj);
    await AnalyticUnit.update(analyticUnitId, {lastDetectionTime: 1000});
    await AnalyticUnitCache.create(analyticUnitId);
    await AnalyticUnitCache.setData(analyticUnitId, {
      windowSize: WINDOW_SIZE,
      timeStep: TIME_STEP
    });
    return analyticUnitId;
  };

  it('check range >= 2 * window size * timeStep', async () => {
    const from = 1500000000000;
    const to = 1500000000001;
    const expectedFrom = to - WINDOW_SIZE * TIME_STEP * 2;

    const id = await addTestUnitToDB();
    await runDetect(id, from, to);
    expect(queryByMetric).toBeCalledWith(analyticUnitObj.metric, undefined, expectedFrom, to, HASTIC_API_KEY);
  });
});
