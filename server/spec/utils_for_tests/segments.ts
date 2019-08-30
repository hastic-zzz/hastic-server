import { TEST_ANALYTIC_UNIT_ID } from './analytic_units';
import * as Segment from '../../src/models/segment_model';

import * as _ from 'lodash';

export function buildSegments(times: number[][]): Segment.Segment[] {
  return times.map(t => {
    return new Segment.Segment(TEST_ANALYTIC_UNIT_ID, t[0], t[1], false, false, undefined);
  });
}

export function convertSegmentsToTimeRanges(segments: Segment.Segment[]): number[][] {
  const ranges = segments.map(segment => [segment.from, segment.to]);
  return _.sortBy(ranges, range => range[0]);
}

export async function clearSegmentsDB(): Promise<void> {
  const segments = await Segment.findMany(TEST_ANALYTIC_UNIT_ID, { labeled: false, deleted: false });
  await Segment.removeSegments(_.compact(segments.map(s => s.id)));
}
