import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';

let db = makeDBQ(Collection.SEGMENTS);


type SegmentId = string;

export class Segment {
  constructor(
    public auId: AnalyticUnitId,
    public from: number,
    public to: number,
    public labeled: boolean,
    public id?: SegmentId
  ) {
    if(auId === undefined) {
      throw new Error('AnalyticUnitId is undefined');
    }
    if(from === undefined) {
      throw new Error('from is undefined');
    }
    if(to === undefined) {
      throw new Error('to is undefined');
    }
    if(labeled === undefined) {
      throw new Error('labeled is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      auId: this.auId,
      from: this.from,
      to: this.to,
      labeled: this.labeled
    };
  }

  static fromObject(obj: any): Segment {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Segment(
      obj.auId, +obj.from, +obj.to,
      obj.labeled, obj.id || obj._id
    );
  }
}

export type FindManyQuery = {
  timeFromGTE?: number,
  timeToLTE?: number,
  intexGT?: number
}

export async function findMany(id: AnalyticUnitId, query: FindManyQuery): Promise<Segment[]> {
  var dbQuery: any = { auId: id };
  if(query.timeFromGTE !== undefined) {
    dbQuery.from = { $gte: query.timeFromGTE };
  }
  if(query.timeToLTE !== undefined) {
    dbQuery.to = { $lte: query.timeToLTE };
  }
  let segs = await db.findMany(dbQuery);
  return segs.map(Segment.fromObject);
}

export async function insertSegments(id: AnalyticUnitId, segments: Segment[]) {
  return db.insertMany(segments.map(s => s.toObject()));
}

export function removeSegments(idsToRemove: SegmentId[]) {
  return db.removeMany(idsToRemove);
}
