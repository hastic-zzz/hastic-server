import { saveAnalyticUnitFromObject, runDetect } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_units';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';

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
                select: [[{"params":["value"],"type":"field"},{"params":[],"type":"mean"}]],"tags":[]}]
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

    async function prepare(): Promise<string> {
        const analyticUnitId = await saveAnalyticUnitFromObject(analyticUnitObj);
        await AnalyticUnit.update(analyticUnitId, {lastDetectionTime: 1000});
        await AnalyticUnitCache.create(analyticUnitId);
        await AnalyticUnitCache.setData(analyticUnitId, {
            windowSize: 1000,
            timeStep: 100
        });
        return analyticUnitId;
    };

    var query = jest.fn();

    it('check range >= 2 * window size', async () => {
        const id = await prepare();
        await runDetect(id, 2000, 3000);
        expect(query).toBeCalledWith(id, {from: 2000, to: 4000});
    });
});