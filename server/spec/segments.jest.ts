import { deleteNonpredictedSegments } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_unit_model';
import * as Segment from '../src/models/segment_model';

import * as _ from 'lodash';

let id: AnalyticUnit.AnalyticUnitId = 'testid';
let baseSegments = segmentBuilder([[0,1], [2,3], [4,5]]);

beforeAll(async () => {
  clearDB();
});

beforeEach(async ()=> {
  await Segment.insertSegments(baseSegments);
});

afterEach(async () => {
  clearDB();
});

describe('Check deleted segments', function() {
  let payload = {
    lastPredictionTime: 0,
    segments: [],
    cache: null
  };

  it('previous segments not found', async function() {
    payload.segments = segmentBuilder([[0,1], [4,5]]);
    expect(await getDeletedSegments(id, payload)).toEqual(segmentBuilder([[2,3]]));
  });

  it('all previous segments found', async function() {
    payload.segments = segmentBuilder([[0,1], [2,3], [4,5]]);
    expect(await getDeletedSegments(id, payload)).toEqual([]);
  });

});

async function getDeletedSegments(id, payload): Promise<Segment.Segment[]> {
  let preSegments = await Segment.findMany(id, {labeled: false, deleted:false});
  await deleteNonpredictedSegments(id, payload);
  let postSegments = await Segment.findMany(id, {labeled: false, deleted:false});
  let deleted = setDifference(preSegments, postSegments);
  deleted = deleted.map(s => {
    s.id = undefined;
    return s;
  });
  return deleted;
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
  let segments = await Segment.findMany(id, {labeled: false, deleted: false});
  await Segment.removeSegments(segments.map(s => s.id));
}
