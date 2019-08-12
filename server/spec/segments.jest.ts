import { deleteNonDetectedSegments } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_units';
import * as Segment from '../src/models/segment_model';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';

import * as _ from 'lodash';

const id: AnalyticUnit.AnalyticUnitId = 'testid';
const baseSegments = segmentBuilder([[0, 1], [2, 3], [4, 5]]);

beforeAll(async () => {
  clearDB();
  await AnalyticUnit.create(
    AnalyticUnit.createAnalyticUnitFromObject({
      _id: id,
      name: 'name',
      grafanaUrl: 'grafanaUrl',
      panelId: 'panelId',
      type: 'type',
      detectorType: AnalyticUnit.DetectorType.ANOMALY
    })
  );
  await AnalyticUnitCache.create(id);
  await AnalyticUnitCache.setData(id, { timeStep: 1 });
});

beforeEach(async () => {
  await Segment.insertSegments(baseSegments);
});

afterEach(async () => {
  clearDB();
});

describe('Check deleted segments', function () {
  let payload = {
    lastDetectionTime: 0,
    segments: [],
    cache: null
  };

  it('previous segments not found', async function () {
    payload.segments = segmentBuilder([[0, 1], [4, 5]]);
    expect(await getDeletedSegments(id, payload)).toEqual(segmentBuilder([[2, 3]]));
  });

  it('all previous segments found', async function () {
    payload.segments = segmentBuilder([[0, 1], [2, 3], [4, 5]]);
    expect(await getDeletedSegments(id, payload)).toEqual([]);
  });

});

async function getDeletedSegments(id, payload): Promise<Segment.Segment[]> {
  const preSegments = await Segment.findMany(id, { labeled: false, deleted: false });
  await deleteNonDetectedSegments(id, payload);
  const postSegments = await Segment.findMany(id, { labeled: false, deleted: false });
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
    return new Segment.Segment(id, t[0], t[1], false, false, undefined);
  });
}

async function clearDB() {
  const segments = await Segment.findMany(id, { labeled: false, deleted: false });
  await Segment.removeSegments(segments.map(s => s.id));
}
