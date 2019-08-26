import { TEST_ANALYTIC_UNIT_ID, createTestDB, clearTestDB } from './utils_for_tests/analytic_units';
import { buildSegments, clearSegmentsDB } from './utils_for_tests/segments';

import * as Segment from '../src/models/segment_model';

import * as _ from 'lodash';

const INITIAL_SEGMENTS = buildSegments([[0, 1], [2, 3], [4, 5]]);

beforeAll(async () => {
  await clearTestDB();
  await createTestDB();
});

beforeEach(async () => {
  await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
});

afterEach(async () => {
  await clearSegmentsDB();
});

describe('mergeAndInsertSegments', function() {
  it('should be merged before insertion', async function() {
    const segmentsToInsert = buildSegments([[1, 2]]);
    await Segment.mergeAndInsertSegments(segmentsToInsert);

    let actualSegments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, {});
    actualSegments.forEach(s => { s.id = undefined });
    actualSegments = _.sortBy(actualSegments, s => s.from);
    expect(actualSegments).toEqual(buildSegments([[0, 3], [4, 5]]));
  });
});

