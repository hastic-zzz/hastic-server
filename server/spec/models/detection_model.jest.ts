import { TEST_ANALYTIC_UNIT_ID } from '../utils_for_tests/analytic_units';
import { buildSpans, clearSpansDB, convertSpansToOptions } from '../utils_for_tests/detection_spans';

import * as Detection from '../../src/models/detection_model';

import * as _ from 'lodash';

const INITIAL_SPANS = buildSpans([
  { from: 1, to: 3, status: Detection.DetectionStatus.READY },
  { from: 3, to: 4, status: Detection.DetectionStatus.RUNNING }
]);

beforeEach(async () => {
  const insertPromises = INITIAL_SPANS.map(async span => Detection.insertSpan(span));
  await Promise.all(insertPromises);
});

afterEach(clearSpansDB);

describe('insertSpan', () => {
  it('should merge spans correctly', async () => {
    const spansToInsert = buildSpans([
      { from: 3, to: 4, status: Detection.DetectionStatus.READY },
      { from: 1, to: 5, status: Detection.DetectionStatus.RUNNING }
    ]);
    const insertPromises = spansToInsert.map(async span => Detection.insertSpan(span));
    await Promise.all(insertPromises);

    const expectedSpans = [
      { from: 1, to: 4, status: Detection.DetectionStatus.READY }
    ];
    const spansInDB = await Detection.findMany(TEST_ANALYTIC_UNIT_ID, { });
    const spansOptions = convertSpansToOptions(spansInDB);
    expect(spansOptions).toEqual(expectedSpans);
  });
});

describe('getIntersectedSpans', () => {
  it('should find intersections correctly', async () => {
    const testCases = [
      {
        from: 1, to: 5,
        expected: [
          { from: 1, to: 3, status: Detection.DetectionStatus.READY },
          { from: 3, to: 4, status: Detection.DetectionStatus.RUNNING }
        ]
      },
      { from: 4, to: 5, expected: [{ from: 3, to: 4, status: Detection.DetectionStatus.RUNNING }] },
      { from: 6, to: 7, expected: [] }
    ]

    for(let testCase of testCases) {
      const intersectedSpans = await Detection.getIntersectedSpans(TEST_ANALYTIC_UNIT_ID, testCase.from, testCase.to);
      const intersectedSpansOptions = convertSpansToOptions(intersectedSpans);
      expect(intersectedSpansOptions).toEqual(testCase.expected);
    }
  });
});

describe('getSpanBorders', () => {
  it('should find span borders correctly', () => {
    const borders = Detection.getSpanBorders(INITIAL_SPANS);
    expect(borders).toEqual([1, 3, 3, 4]);
  });
});
