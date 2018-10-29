import { deleteNonpredictedSegments } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_unit_model';
import * as Segment from '../src/models/segment_model';

import * as _ from 'lodash';

let id: AnalyticUnit.AnalyticUnitId = 'testid';
let baseSegments = segmentBuilder([[0,1], [2,3], [4,5]]);

beforeEach(async ()=> {
  let segments = await Segment.findMany(id, {labeled: false, deleted: false});
  await Segment.removeSegments(segments.map(s => s.id));
  await Segment.insertSegments(baseSegments);
});

describe("Check deleted segments", function() {

  it('deleted should be non empty', async function() {
    let payload = {
      lastPredictionTime: 0,
      segments: [],
      cache: null
    };

    payload.segments = segmentBuilder([[0,1], [4,5]]);

    let preSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = setDifference(preSegments, postSegments);
    console.log('kek',preSegments,postSegments);
    expect(deleted).toEqual(segmentBuilder([[2,3]]));
  });

  it('deleted should be empty', async function() {
    let payload = {
      lastPredictionTime: 0,
      segments: [],
      cache: null
    };

    payload.segments = segmentBuilder([[0,1], [2,3], [4,5]]);
    
    let preSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = setDifference(preSegments, postSegments);
    expect(deleted).toEqual([]);
  });

})

function setDifference(a, b: Segment.Segment[]): Segment.Segment[] {
  return _.differenceWith(a, b, (x, y: Segment.Segment) => {
    return x.equals(y);
  });
}

function segmentBuilder(times) {
  return times.map(t => {
    return new Segment.Segment(id, t[0], t[1], false, false);
  });
}
