import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Segment from '../models/segment_model';


export async function getSegments(analyticUnitId: AnalyticUnitId, from: number, to:number, lastSegmentId: number):
  Promise<Segment.Segment[]> {

  let query: Segment.FindManyQuery = {};

  query.intexGT = lastSegmentId;
  query.timeFromGTE = from;
  query.timeToLTE = to;

  return await Segment.findMany(analyticUnitId, query);
}
