import { deleteNonDetectedSegments } from '../src/controllers/analytics_controller';
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

describe('Check deleted segments', function() {
  let payload = {
    lastDetectionTime: 0,
    segments: [],
    cache: null
  };

  it('previous segments not found', async function() {
    payload.segments = segmentBuilder([[0, 1], [4, 5]]);
    expect(await getDeletedSegments(TEST_ID, payload)).toEqual(segmentBuilder([[2, 3]]));
  });

  it('all previous segments found', async function() {
    payload.segments = segmentBuilder([[0, 1], [2, 3], [4, 5]]);
    expect(await getDeletedSegments(TEST_ID, payload)).toEqual([]);
  });

});

async function getDeletedSegments(TEST_ID, payload): Promise<Segment.Segment[]> {
  const preSegments = await Segment.findMany(TEST_ID, { labeled: false, deleted: false });
  await deleteNonDetectedSegments(TEST_ID, payload);
  const postSegments = await Segment.findMany(TEST_ID, { labeled: false, deleted: false });
  const deleted = setDifference(preSegments, postSegments);
  return deleted.map(s => {
    s.id = undefined;
    return s;
  });
}

function setDifference(a, b: Segment.Segment[]): Segment.Segment[] {
  return _.differenceWith(a, b, (x, y: Segment.Segment) => x.equals(y));
}

function segmentBuilder(times) {
  return times.map(t => {
    return new Segment.Segment(TEST_ID, t[0], t[1], false, false, undefined);
  });
}

async function clearDB() {
  const segments = await Segment.findMany(TEST_ID, { labeled: false, deleted: false });
  await Segment.removeSegments(segments.map(s => s.id));
}
