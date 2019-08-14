import { TEST_ANALYTIC_UNIT_ID } from '../utils_for_tests/analytic_units';
import { buildSegments, clearSegmentsDB, convertSegmentsToTimeRanges } from '../utils_for_tests/segments';

import * as Segment from '../../src/models/segment_model';

const INITIAL_SEGMENTS = buildSegments([[0, 1], [2, 3], [4, 5]]);

beforeEach(async () => {
  await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
});

afterEach(async () => {
  await clearSegmentsDB();
});

describe('mergeAndInsertSegments', function() {
  it('Should be merged before insertion', async function() {
    const segmentsToInsert = buildSegments([[1, 2]]);
    await Segment.mergeAndInsertSegments(segmentsToInsert);

    let actualSegments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, {});
    
    expect(
      convertSegmentsToTimeRanges(actualSegments)
    ).toEqual([[0, 3], [4, 5]]);
  });
});

