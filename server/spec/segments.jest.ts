import { deleteNonpredictedSegments } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_unit_model';
import * as Segment from '../src/models/segment_model';

let id: AnalyticUnit.AnalyticUnitId = 'auid';
let baseSegments = segmentBuilder([[0,1], [2,3], [4,5]]);

beforeEach(()=> {
  Segment.insertSegments(baseSegments);
});

describe("Check deleted segments", function() {
  let payload = {
    lastPredictionTime: 0,
    segments: [],
    cache: null
  }

  it("deleted should be empty", async function() {
    payload.segments = segmentBuilder([[0,1], [2,3], [4,5]]);
    
    let preSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = setDifference(preSegments, postSegments);
    expect(deleted).toEqual([]);
  });

  it("deleted should be non empty", async function() {
    payload.segments = segmentBuilder([[0,1], [4,5]]);

    let preSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = await Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = setDifference(preSegments, postSegments);
    expect(deleted).toEqual(segmentBuilder([[2,3]]));
  });


})

function setDifference(a, b) {
  let diffA = a.filter(x => a.indexOf(x) < 0);
  console.log(diffA);
  let diffB = b.filter(x => b.indexOf(x) < 0);
  console.log(diffB);
  return diffA.concat(diffB);
}

function segmentBuilder(times) {
  return times.map(t => {
    return new Segment.Segment('auid',t[0], t[1],false,false);
  });
}
