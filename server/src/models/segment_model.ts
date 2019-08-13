import { AnalyticUnitId } from './analytic_units';
import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import { Collection, makeDBQ } from '../services/data_service';

import * as _ from 'lodash';

let db = makeDBQ(Collection.SEGMENTS);


export type SegmentId = string;

export class Segment {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public from: number,
    public to: number,
    public labeled: boolean = false,
    public deleted: boolean = false,
    public id?: SegmentId,
    public message?: string
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
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      from: this.from,
      to: this.to,
      labeled: this.labeled,
      deleted: this.deleted,
      message: this.message
    };
  }

  static fromObject(obj: any): Segment {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Segment(
      obj.analyticUnitId,
      +obj.from, +obj.to,
      obj.labeled, obj.deleted,
      obj._id, obj.message
    );
  }

  public equals(obj: Segment) : boolean {
    return this.analyticUnitId === obj.analyticUnitId &&
           this.from === obj.from &&
           this.to === obj.to &&
           this.labeled === this.labeled &&
           this.deleted === this.deleted;
  }
}

export type FindManyQuery = {
  $or?: any,
  from?: { $gte?: number, $lte?: number },
  to?: { $gte?: number, $lte?: number },
  labeled?: boolean,
  deleted?: boolean
}

export async function findOne(segmentId: SegmentId) {
  return db.findOne({ _id: segmentId });
}

export async function findMany(id: AnalyticUnitId, query: FindManyQuery): Promise<Segment[]> {
  var dbQuery: any = { analyticUnitId: id };
  if(query.labeled !== undefined) {
    dbQuery.labeled = query.labeled;
  }
  if(query.deleted !== undefined) {
    dbQuery.deleted = query.deleted;
  }
  let segs = await db.findMany(dbQuery);
  if(segs === null) {
    return [];
  }
  return segs.map(Segment.fromObject);
}

export async function mergeAndInsertSegments(segments: Segment[]): Promise<SegmentId[]> {
  if(_.isEmpty(segments)) {
    return [];
  }
  const analyticUnitId: AnalyticUnitId = segments[0].analyticUnitId;
  let segmentIdsToRemove: SegmentId[] = [];
  let segmentsToInsert: Segment[] = [];

  for(let segment of segments) {
    if(await isIntersectedWithExistingLabeled(segment)) {
      continue;
    }

    if(!segment.deleted && !segment.labeled) {
      if(await isIntersectedWithExistingDeleted(segment)) {
        continue;
      }
    }

    let cache = await AnalyticUnitCache.findById(analyticUnitId);
    let unit = await AnalyticUnit.findById(analyticUnitId);
    const detector = unit.detectorType;

    let intersectedSegments: Segment[];
    if(detector === AnalyticUnit.DetectorType.PATTERN) {
      intersectedSegments = await findMany(analyticUnitId, {
        to: { $gte: segment.from },
        from: { $lte: segment.to },
        labeled: segment.labeled,
        deleted: segment.deleted
      });
    } else {
      const timeStep = cache.getTimeStep();
      intersectedSegments = await findMany(analyticUnitId, {
        to: { $gte: segment.from - timeStep },
        from: { $lte: segment.to + timeStep },
        labeled: segment.labeled,
        deleted: segment.deleted
      });
    }

    if(intersectedSegments.length > 0) {
      let from = _.minBy(intersectedSegments, s => s.from).from;
      let to = _.maxBy(intersectedSegments, s => s.to).to;
      let newSegment = Segment.fromObject(segment.toObject());
      newSegment.from = from;
      newSegment.to = to;
      segmentIdsToRemove = segmentIdsToRemove.concat(intersectedSegments.map(s => s.id));
      segmentsToInsert.push(newSegment);
    } else {
      segmentsToInsert.push(segment);
    }
  }

  await db.removeMany(segmentIdsToRemove);
  return db.insertMany(segmentsToInsert.map(s => s.toObject()));
}

export async function setSegmentsDeleted(ids: SegmentId[]) {
  return db.updateMany(ids, { deleted: true, labeled: false });
}

export function removeSegments(idsToRemove: SegmentId[]) {
  return db.removeMany(idsToRemove);
}

async function isIntersectedWithExistingLabeled(segment: Segment): Promise<boolean> {
  const intersected = await findMany(segment.analyticUnitId, {
    labeled: true,
    deleted: false,
    from: { $lte: segment.to },
    to: { $gte: segment.from }
  });

  return intersected.length > 0;
}

async function isIntersectedWithExistingDeleted(segment: Segment): Promise<boolean> {
  const intersected = await findMany(segment.analyticUnitId, {
    labeled: false,
    deleted: true,
    from: { $lte: segment.to },
    to: { $gte: segment.from }
  });

  return intersected.length > 0;
}
