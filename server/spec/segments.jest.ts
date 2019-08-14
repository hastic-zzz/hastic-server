import { buildSegments, clearDB, TEST_ANALYTIC_UNIT_ID } from './utils_for_tests/segments';

import * as AnalyticUnit from '../src/models/analytic_units';
import * as Segment from '../src/models/segment_model';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';

import * as _ from 'lodash';

const INITIAL_SEGMENTS = buildSegments([[0, 1], [2, 3], [4, 5]]);

beforeAll(async () => {
  clearDB();
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
});

beforeEach(async () => {
  await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
});

afterEach(async () => {
  clearDB();
});

describe('mergeAndInsertSegments', function() {
  it('Should be merged before insertion', async function() {
    const segmentsToInsert = buildSegments([[1, 2]]);
    await Segment.mergeAndInsertSegments(segmentsToInsert);

    let actualSegments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, {});
    actualSegments.forEach(s => { s.id = undefined });
    actualSegments = _.sortBy(actualSegments, s => s.from);
    expect(actualSegments).toEqual(buildSegments([[0, 3], [4, 5]]));
  });
});

