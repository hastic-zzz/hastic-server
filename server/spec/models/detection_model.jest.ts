import { TEST_ANALYTIC_UNIT_ID } from '../utils_for_tests/analytic_units';
import { insertSpans, clearSpansDB, convertSpansToOptions } from '../utils_for_tests/detection_spans';

import * as Detection from '../../src/models/detection_model';

import * as _ from 'lodash';

afterEach(clearSpansDB);

describe('insertSpan', () => {
  it('should merge spans with the same status', async () => {
    /* 
     * Config for test
     * insert -- what we want to insert in our test database
     * expectedAfterInsertion -- expected database state after insertion
     */
    const insertSteps = [
      {
        insert: [
          { from: 1, to: 3, status: Detection.DetectionStatus.READY },
          { from: 4, to: 5, status: Detection.DetectionStatus.RUNNING }
        ],
        expectedAfterInsertion: [
          { from: 1, to: 3, status: Detection.DetectionStatus.READY },
          { from: 4, to: 5, status: Detection.DetectionStatus.RUNNING }
        ]
      },
      { 
        insert: [ { from: 5, to: 9, status: Detection.DetectionStatus.RUNNING } ],
        expectedAfterInsertion: [
          { from: 1, to: 3, status: Detection.DetectionStatus.READY },
          { from: 4, to: 9, status: Detection.DetectionStatus.RUNNING }
        ] 
      },
      {
        insert: [ { from: 2, to: 5, status: Detection.DetectionStatus.READY } ],
        expectedAfterInsertion: [
          { from: 1, to: 5, status: Detection.DetectionStatus.READY },
          { from: 4, to: 9, status: Detection.DetectionStatus.RUNNING }
        ]
      },
    ];

    for(let step of insertSteps) {
      await insertSpans(step.insert);
      const spansInDB = await Detection.findMany(TEST_ANALYTIC_UNIT_ID, {});
      const spansOptions = convertSpansToOptions(spansInDB);
      expect(spansOptions).toEqual(step.expectedAfterInsertion);
    }
  });


  it('should merge spans if existing span is inside the one being inserted', async () => {
    await insertSpans([
      { from: 1, to: 6, status: Detection.DetectionStatus.RUNNING }
    ]);

    const expectedSpans = [
      { from: 1, to: 6, status: Detection.DetectionStatus.RUNNING }
    ];
    const spansInDB = await Detection.findMany(TEST_ANALYTIC_UNIT_ID, {});
    const spansOptions = convertSpansToOptions(spansInDB);
    expect(spansOptions).toEqual(expectedSpans);
  });
});

describe('getIntersectedSpans', () => {
  it('should find all intersections with the inserted span', async () => {
    await insertSpans([
      { from: 1, to: 3, status: Detection.DetectionStatus.READY },
      { from: 4, to: 5, status: Detection.DetectionStatus.RUNNING }
    ]);

    const testCases = [
      {
        from: 1, to: 5,
        expected: [
          { from: 1, to: 3, status: Detection.DetectionStatus.READY },
          { from: 4, to: 5, status: Detection.DetectionStatus.RUNNING }
        ]
      },
      { from: 4, to: 5, expected: [{ from: 4, to: 5, status: Detection.DetectionStatus.RUNNING }] },
      { from: 6, to: 7, expected: [] }
    ]

    for(let testCase of testCases) {
      const intersectedSpans = await Detection.getIntersectedSpans(TEST_ANALYTIC_UNIT_ID, testCase.from, testCase.to);
      const intersectedSpansOptions = convertSpansToOptions(intersectedSpans);
      expect(intersectedSpansOptions).toEqual(testCase.expected);
    }
  });
});

