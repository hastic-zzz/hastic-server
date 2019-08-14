import * as Segment from '../../src/models/segment_model';
import { buildSegments, clearDB, TEST_ANALYTIC_UNIT_ID } from '../utils_for_tests/segments';
import { getSegments } from '../../src/routes/segments_router';
import { IRouterContext } from 'koa-router';

const INITIAL_SEGMENTS = buildSegments([[0, 3], [5, 6], [10, 13]]);

beforeEach(async () => {
  await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
});

afterEach(async () => {
  await clearDB();
});

describe('getSegments', () => {
  it('should return intersected segments', async () => {
    const testCases = [
      {
        from: 1,
        to: 4,
        expected: [[0, 3]]
      },
      {
        from: 11,
        to: 12,
        expected: [[10, 13]]
      },
      {
        from: 6,
        to: 10,
        expected: [[5, 6], [10, 13]]
      },
      {
        from: 16,
        to: 17,
        expected: []
      }
    ];
    for(let testCase of testCases) {
      let ctx = generateTimeRangeQuery(testCase.from, testCase.to);
      await getSegments(ctx);

      const gotSegments = ctx.response.body.segments.map(segment => [segment.from, segment.to]);
      expect(gotSegments).toEqual(testCase.expected);
    }
  });
});

function generateTimeRangeQuery(from: number, to: number): IRouterContext {
  return {
    request: {
      query: {
        id: TEST_ANALYTIC_UNIT_ID,
        from,
        to
      }
    },
    response: {}
  } as IRouterContext;
}
