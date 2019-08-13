import * as AnalyticUnit from '../src/models/analytic_units';
import * as Segment from '../src/models/segment_model';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';

import * as _ from 'lodash';

const TEST_ID: AnalyticUnit.AnalyticUnitId = 'testid';
const INITIAL_SEGMENTS = segmentBuilder([[0, 1], [2, 3], [4, 5]]);

beforeAll(async () => {
  clearDB();
  await AnalyticUnit.create(
    AnalyticUnit.createAnalyticUnitFromObject({
      _id: TEST_ID,
      name: 'name',
      grafanaUrl: 'grafanaUrl',
      panelId: 'panelId',
      type: 'type',
      detectorType: AnalyticUnit.DetectorType.ANOMALY
    })
  );
  await AnalyticUnitCache.create(TEST_ID);
  await AnalyticUnitCache.setData(TEST_ID, { timeStep: 1 });
});

beforeEach(async () => {
  await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
});

afterEach(async () => {
  clearDB();
});

function segmentBuilder(times) {
  return times.map(t => {
    return new Segment.Segment(TEST_ID, t[0], t[1], false, false, undefined);
  });
}

async function clearDB() {
  const segments = await Segment.findMany(TEST_ID, { labeled: false, deleted: false });
  await Segment.removeSegments(segments.map(s => s.id));
}
