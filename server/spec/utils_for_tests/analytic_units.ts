import * as AnalyticUnit from '../../src/models/analytic_units';
import * as AnalyticUnitCache from '../../src/models/analytic_unit_cache_model';


export const TEST_ANALYTIC_UNIT_ID: AnalyticUnit.AnalyticUnitId = 'testid';

export async function createTestDB() {
    await AnalyticUnit.create(
      AnalyticUnit.createAnalyticUnitFromObject({
        _id: TEST_ANALYTIC_UNIT_ID,
        name: 'name',
        grafanaUrl: 'grafanaUrl',
        panelId: 'panelId',
        type: 'type',
        detectorType: AnalyticUnit.DetectorType.ANOMALY
      })
    );
    await AnalyticUnitCache.create(TEST_ANALYTIC_UNIT_ID);
    await AnalyticUnitCache.setData(TEST_ANALYTIC_UNIT_ID, { timeStep: 1 });
}

export async function clearTestDB() {
    await AnalyticUnit.remove(TEST_ANALYTIC_UNIT_ID);
    await AnalyticUnitCache.remove(TEST_ANALYTIC_UNIT_ID);
}
