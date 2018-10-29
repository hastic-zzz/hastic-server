//import {app} from '../src/index'
import { deleteNonpredictedSegments } from '../src/controllers/analytics_controller'
import * as AnalyticUnit from '../src/models/analytic_unit_model'
import * as Segment from '../src/models/segment_model';
import { Collection, makeDBQ } from '../src/services/data_service';

jest.mock('../__mocks__/nedb');

//beforeAll(() => {
//});

//afterAll(() => {
//});


describe("Check deleted segments", function() {

  let id: AnalyticUnit.AnalyticUnitId = 'auid';
  //let db = makeDBQ(Collection.SEGMENTS);

  it("deleted should be empty", function() {
    let payload = [];
    
    let preSegments = Segment.findMany(id, {labeled: false, deleted:false});
    deleteNonpredictedSegments(id, payload);
    let postSegments = Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = [];
    expect(deleted).toBe([]);
  });

  it("deleted should be non empty", function() {
    let payload = [];
    let preSegments = Segment.findMany(id, {labeled: false, deleted:false});
    deleteNonpredictedSegments(id, payload);
    let postSegments = Segment.findMany(id, {labeled: false, deleted:false});
    let deleted = [];
    expect(deleted).toBe([]);
  });


})
