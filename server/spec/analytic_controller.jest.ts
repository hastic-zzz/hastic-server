import { queryByMetric } from 'grafana-datasource-kit';

jest.mock('grafana-datasource-kit', () => (
  {
    ...(jest.requireActual('grafana-datasource-kit')),
    queryByMetric: jest.fn((metric, url, from, to, apiKey) => {
      return { values:[], columns:[] }
    })
  }
));

import { runDetect, onDetect, getHSR } from '../src/controllers/analytics_controller';
import * as AnalyticUnitCache from '../src/models/analytic_unit_cache_model';
import * as Segment from '../src/models/segment_model';
import { TEST_ANALYTIC_UNIT_ID, createTestDB, clearTestDB, DEFAULT_METRIC } from './utils_for_tests/analytic_units';
import { buildSegments, clearSegmentsDB, convertSegmentsToTimeRanges } from './utils_for_tests/segments';
import { HASTIC_API_KEY, GRAFANA_URL } from '../src/config';

import * as _ from 'lodash';
import * as AnalyticUnit from '../src/models/analytic_units';

const WINDOW_SIZE = 10;
const TIME_STEP = 1000;

beforeEach(async () => {
  await clearTestDB();
  await createTestDB();
});

describe('Check detection range', function() {
  it('range should be >= 2 * windowSize * timeStep', async () => {
    const from = 1500000000000;
    const to = 1500000000001;
    const expectedFrom = to - WINDOW_SIZE * TIME_STEP * 2;

    await AnalyticUnitCache.setData(TEST_ANALYTIC_UNIT_ID, {timeStep: TIME_STEP, windowSize: WINDOW_SIZE });
    console.log(await AnalyticUnitCache.findById(TEST_ANALYTIC_UNIT_ID));
    await runDetect(TEST_ANALYTIC_UNIT_ID, from, to);
    expect(queryByMetric).toBeCalledWith(DEFAULT_METRIC, GRAFANA_URL, expectedFrom, to, HASTIC_API_KEY);
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
  let cacheToSave: AnalyticUnitCache.AnalyticUnitCache;

  beforeAll(async () => {
    await clearTestDB();
    await createTestDB(false);
  });

  afterAll(async () => {
    await AnalyticUnitCache.create(TEST_ANALYTIC_UNIT_ID);
    await AnalyticUnitCache.setData(TEST_ANALYTIC_UNIT_ID, cacheToSave.data);
  });

  it('should return nothing if unit state is LEARNING', async () => {
    const unit = await AnalyticUnit.findById(TEST_ANALYTIC_UNIT_ID);
    const result = await getHSR(unit, 9000, 100000);
    expect(result).toEqual({"hsr": {"columns": [], "values": []}});
  });
});
