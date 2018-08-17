import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';

let db = makeDBQ(Collection.SEGMENTS);


export type SegmentId = string;

export class Segment {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public from: number,
    public to: number,
    public labeled: boolean,
    public id?: SegmentId
  ) {
    if(analyticUnitId === undefined) {
      throw new Error('AnalyticUnitId is undefined');
    }
    if(from === undefined) {
      throw new Error('from is undefined');
    }
    if(isNaN(from)) {
      throw new Error('from is NaN');
    }
    if(to === undefined) {
      throw new Error('to is undefined');
    }
    if(isNaN(to)) {
      throw new Error('to is NaN');
    }
    if(labeled === undefined) {
      throw new Error('labeled is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
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
      obj.analyticUnitId, 
      +obj.from, +obj.to,
      obj.labeled, obj._id
    );
  }
}

export type FindManyQuery = {
  timeFromGTE?: number,
  timeToLTE?: number,
  intexGT?: number,
  labeled?: boolean
}

export async function findMany(id: AnalyticUnitId, query: FindManyQuery): Promise<Segment[]> {
  var dbQuery: any = { analyticUnitId: id };
  if(query.timeFromGTE !== undefined) {
    dbQuery.from = { $gte: query.timeFromGTE };
  }
  if(query.timeToLTE !== undefined) {
    dbQuery.to = { $lte: query.timeToLTE };
  }
  if(query.labeled !== undefined) {
    dbQuery.labeled = query.labeled;
  }
  let segs = await db.findMany(dbQuery);
  if(segs === null) {
    return [];
  }
  return segs.map(Segment.fromObject);
}

export async function insertSegments(segments: Segment[]) {
  return db.insertMany(segments.map(s => s.toObject()));
}

export function removeSegments(idsToRemove: SegmentId[]) {
  return db.removeMany(idsToRemove);
}
