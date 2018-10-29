import { deleteNonpredictedSegments } from '../src/controllers/analytics_controller'
import * as AnalyticUnit from '../src/models/analytic_unit_model'
import * as Segment from '../src/models/segment_model';
import { Collection, makeDBQ } from '../src/services/data_service';

var id: AnalyticUnit.AnalyticUnitId = 'auid';

beforeAll(() => {
  let times = [[0,1], [2,3], [4,5]];
  let segments = times.map(t => {
    return new Segment.Segment('auid',t[0], t[1],false,false); 
  });
  Segment.insertSegments(segments);
});

describe("Check deleted segments", function() {
  let payload = {
    lastPredictionTime: 0,
    segments: [],
    cache: null
  }

  it("deleted should be empty", function() {
    payload.segments = [];
    
    let preSegments = Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = postSegments.remove() ;
    expect(deleted).toBe([]);
  });

  it("deleted should be non empty", function() {
    payload.segments = [];
    let preSegments = Segment.findMany(id, {labeled: false, deleted:false});
    await deleteNonpredictedSegments(id, payload);
    let postSegments = Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = [];
    expect(deleted).toBe([]);
  });


})
