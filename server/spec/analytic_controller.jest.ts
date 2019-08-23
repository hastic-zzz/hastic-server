import { queryByMetric } from 'grafana-datasource-kit';

jest.mock('grafana-datasource-kit', () => (
  {
    ...(jest.requireActual('grafana-datasource-kit')),
    queryByMetric: jest.fn((metric, url, from, to, apiKey) => {
      return { values:[], columns:[] }
    })
  }
));

import { saveAnalyticUnitFromObject, runDetect, onDetect, getHSR } from '../src/controllers/analytics_controller';
import * as AnalyticUnit from '../src/models/analytic_units';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';
import * as Segment from '../src/models/segment_model';
import { TEST_ANALYTIC_UNIT_ID, getAnalyticUnitFromDb } from './utils_for_tests/analytic_units';
import { buildSegments, clearSegmentsDB, convertSegmentsToTimeRanges } from './utils_for_tests/segments';
import { HASTIC_API_KEY } from '../src/config';

import * as _ from 'lodash';

const WINDOW_SIZE = 10;
const TIME_STEP = 1000;

describe('Check detection range', function() {
  it('range should be >= 2 * windowSize * timeStep', async () => {
    const from = 1500000000000;
    const to = 1500000000001;
    const expectedFrom = to - WINDOW_SIZE * TIME_STEP * 2;

    const testAnalyticUnit = await getAnalyticUnitFromDb();
    await AnalyticUnitCache.create(testAnalyticUnit.id);
    await AnalyticUnitCache.setData(testAnalyticUnit.id, {timeStep: TIME_STEP, windowSize: WINDOW_SIZE});
    await runDetect(testAnalyticUnit.id, from, to);
    expect(queryByMetric).toBeCalledWith(testAnalyticUnit.unit.metric, undefined, expectedFrom, to, HASTIC_API_KEY);
  });
});

describe('onDetect', () => {
  const INITIAL_SEGMENTS = buildSegments([[0, 1], [2, 3], [4, 5]]);

  beforeEach(async () => {
    await Segment.mergeAndInsertSegments(INITIAL_SEGMENTS);
  });

  afterEach(async () => {
    await clearSegmentsDB();
  });

  it('should not send a webhook after merging', async () => {
    const detectedSegmentIds = await onDetect({
      analyticUnitId: TEST_ANALYTIC_UNIT_ID,
      segments: buildSegments([[5, 6]]),
      lastDetectionTime: 0,
      cache: {
        data: {
          timeStep: 1
        }
      }
    });
    const detectedSegments = await Promise.all(
      detectedSegmentIds.map(id => Segment.findOne(id))
    );

    const detectedRanges = convertSegmentsToTimeRanges(detectedSegments);
    expect(detectedRanges).toEqual([]);
  });

  it('should send a webhook when there was no merging', async () => {
    const detectedSegmentIds = await onDetect({
      analyticUnitId: TEST_ANALYTIC_UNIT_ID,
      segments: buildSegments([[7, 8]]),
      lastDetectionTime: 0
    });
    const detectedSegments = await Promise.all(
      detectedSegmentIds.map(id => Segment.findOne(id))
    );

    const detectedRanges = convertSegmentsToTimeRanges(detectedSegments);
    expect(detectedRanges).toEqual([[7, 8]]);
  });
});

describe('getHSR', function() {
  it('should return nothing if unit state is LEARNING', async () => {
    const testAnalyticUnit = await getAnalyticUnitFromDb(AnalyticUnit.DetectorType.ANOMALY);
    const result = await getHSR(testAnalyticUnit.unit, 9000, 100000);
    expect(result).toEqual({"hsr": {"columns": [], "values": []}});
  });
});
