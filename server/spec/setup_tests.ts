import * as AnalyticUnit from '../src/models/analytic_units';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';
import { TEST_ANALYTIC_UNIT_ID } from './utils_for_tests/analytic_units';
import { clearSegmentsDB } from './utils_for_tests/segments';

console.log = jest.fn();
console.error = jest.fn();

jest.mock('../src/config.ts', () => ({
  HASTIC_API_KEY: 'fake-key',
  DATA_PATH: 'fake-data-path',
  ZMQ_IPC_PATH: 'fake-zmq-path'
}));

createTestDB();

async function createTestDB() {
  await clearSegmentsDB();
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
