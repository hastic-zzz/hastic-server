import { TEST_ANALYTIC_UNIT_ID } from '../utils_for_tests/analytic_units';
import { buildSegments, clearSegmentsDB, convertSegmentsToTimeRanges } from '../utils_for_tests/segments';

import * as Segment from '../../src/models/segment_model';

afterEach(async () => {
  await clearSegmentsDB();
});

describe('mergeAndInsertSegments', function() {
  const initialSegments = buildSegments([[0, 1], [2, 3], [4, 5]]);

  beforeEach(async () => {
    await Segment.mergeAndInsertSegments(initialSegments);
  });

  it('Segments should be merged before insertion', async function() {
    const segmentsToInsert = buildSegments([[1, 2]]);
    await Segment.mergeAndInsertSegments(segmentsToInsert);

    const actualSegments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, {});
    const actualRanges = convertSegmentsToTimeRanges(actualSegments);

    expect(actualRanges).toEqual([[0, 3], [4, 5]]);
  });
});

describe('findIntersectedSegments', () => {
  const initialSegments = buildSegments([[0, 3], [5, 6], [10, 13]]);

  beforeEach(async () => {
    await Segment.mergeAndInsertSegments(initialSegments);
  });

  it('should find intersected segments', async () => {
    const testCases = [
      { from: 1, to: 4, expected: [[0, 3]] },
      { from: 11, to: 12, expected: [[10, 13]] },
      { from: 6, to: 10, expected: [[5, 6], [10, 13]] },
      { from: 16, to: 17, expected: [] },
      { from: 5, expected: [[5, 6], [10, 13]] },
      { to: 5, expected: [[0, 3], [5, 6]] },
      { expected: [[0, 3], [5, 6], [10, 13]] }
    ];

    for(let testCase of testCases) {
      const foundSegments = await Segment.findIntersectedSegments(TEST_ANALYTIC_UNIT_ID, testCase.from, testCase.to);
      const foundRanges = convertSegmentsToTimeRanges(foundSegments);
      expect(foundRanges).toEqual(testCase.expected);
    }
  });
});
