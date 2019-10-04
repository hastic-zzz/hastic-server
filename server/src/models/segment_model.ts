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

export async function findOne(segmentId: SegmentId): Promise<Segment> {
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
  if(query.from !== undefined) {
    dbQuery.from = query.from;
  }
  if(query.to !== undefined) {
    dbQuery.to = query.to;
  }
  if(query.$or !== undefined) {
    dbQuery.$or = query.$or;
  }
  let segs = await db.findMany(dbQuery);
  if(segs === null) {
    return [];
  }
  return segs.map(Segment.fromObject);
}


/**
 * If `from` and `to` are defined: @returns segments intersected with `[from; to]`
 * If `to` is `undefined`: @returns segments intersected with `[-inf; from]`
 * If `from` is `undefined`: @returns segments intersected with `[to: +inf]`
 * If `from` and `to` are undefined: @returns all segments
 */
export async function findIntersectedSegments(
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  from?: number,
  to?: number
): Promise<Segment[]> {
  let query: FindManyQuery = {};
  if(from !== undefined) {
    query.to = { $gte: from };
  }
  if(to !== undefined) {
    query.from = { $lte: to };
  }
  return findMany(analyticUnitId, query);
}


// TODO: rewrite all this horrible function
// TODO: use utils.segments.IntegerSegmentsSet
/**
 * Merges an array of segments with ones existing in the DB
 * Inserts resulting segments into DB
 * @param segments segments to be inserted
 * @returns IDs of added and removed segments
 */
export async function mergeAndInsertSegments(segments: Segment[]): Promise<{
  addedIds: SegmentId[],
  removedIds: SegmentId[]
}> {
  if(_.isEmpty(segments)) {
    return { addedIds: [], removedIds: [] };
  }
  const analyticUnitId: AnalyticUnitId = segments[0].analyticUnitId;
  const unit = await AnalyticUnit.findById(analyticUnitId);
  if(unit === null) {
    throw new Error('Can`t find analytic unit ' + analyticUnitId);
  }
  const cache = await AnalyticUnitCache.findById(analyticUnitId);

  const detector = unit.detectorType;

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

    let intersectedSegments: Segment[] = [];
    if(detector === AnalyticUnit.DetectorType.PATTERN) {
      intersectedSegments = await findMany(analyticUnitId, {
        to: { $gte: segment.from },
        from: { $lte: segment.to },
        labeled: segment.labeled,
        deleted: segment.deleted
      });
    } else {
      let intersectionRangeExtension = 0;
      if(cache !== null) {
        const timeStep = cache.timeStep;
        if(timeStep !== undefined) {
          intersectionRangeExtension = timeStep;
        }
      }
      intersectedSegments = await findMany(analyticUnitId, {
        to: { $gte: segment.from - intersectionRangeExtension },
        from: { $lte: segment.to + intersectionRangeExtension },
        labeled: segment.labeled,
        deleted: segment.deleted
      });
    }

    if(intersectedSegments.length > 0) {
      let intersectedIds = intersectedSegments.map(s => s.id);
      let minFromSegment = _.minBy(intersectedSegments.concat(segment), s => s.from);
      let maxToSegment = _.maxBy(intersectedSegments.concat(segment), s => s.to);

      if(minFromSegment === undefined) {
        throw new Error('minFromSegment is undefined');
      }

      if(maxToSegment === undefined) {
        throw new Error('maxToSegment is undefined');
      }

      let from = minFromSegment.from;
      let to = maxToSegment.to;
      let newSegment = Segment.fromObject(segment.toObject());
      newSegment.from = from;
      newSegment.to = to;
      segmentIdsToRemove = segmentIdsToRemove.concat(_.compact(intersectedIds));
      segmentsToInsert.push(newSegment);
    } else {
      segmentsToInsert.push(segment);
    }
  }
  await db.removeMany(segmentIdsToRemove);
  const addedIds = await db.insertMany(segmentsToInsert.map(s => s.toObject()));
  return {
    addedIds,
    removedIds: segmentIdsToRemove
  };
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
