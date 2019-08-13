import * as AnalyticUnit from '../../src/models/analytic_units';
import * as Segment from '../../src/models/segment_model';

export const TEST_ANALYTIC_UNIT_ID: AnalyticUnit.AnalyticUnitId = 'testid';

export function buildSegments(times: number[][]): Segment.Segment[] {
  return times.map(t => {
    return new Segment.Segment(TEST_ANALYTIC_UNIT_ID, t[0], t[1], false, false, undefined);
  });
}

export async function clearDB(): Promise<void> {
  const segments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, { labeled: false, deleted: false });
  await Segment.removeSegments(segments.map(s => s.id));
}
