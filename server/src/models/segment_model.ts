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
  timeFromGTE?: number,
  timeToLTE?: number,
  intexGT?: number,
  labeled?: boolean,
  deleted?: boolean
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
  if(query.deleted !== undefined) {
    dbQuery.deleted = query.deleted;
  }
  let segs = await db.findMany(dbQuery);
  if(segs === null) {
    return [];
  }
  return segs.map(Segment.fromObject);
}

export async function insertSegments(segments: Segment[]) {
  if(_.isEmpty(segments)) {
    return [];
  }
  const analyticUnitId: AnalyticUnitId = segments[0].analyticUnitId;
  const learningSegments: Segment[] = await db.findMany({
    analyticUnitId,
    labeled: true,
    deleted: false
  });

  let segmentIdsToRemove: SegmentId[] = [];
  let segmentsToInsert: Segment[] = [];

  for(let segment of segments) {
    const intersectedLearning = learningSegments.filter(s => {
      return segment.from <= s.to && segment.to >= s.from;
    });
    if(intersectedLearning.length > 0) {
      continue;
    }

    if(!segment.deleted && !segment.labeled) {
      const intersectedWithDeletedSegments = await db.findMany({
        analyticUnitId,
        to: { $gte: segment.from },
        from: { $lte: segment.to },
        labeled: false,
        deleted: true
      });

      if(intersectedWithDeletedSegments.length > 0) {
        continue;
      }
    }

    const intersectedSegments = await db.findMany({
      analyticUnitId,
      to: { $gte: segment.from },
      from: { $lte: segment.to },
      labeled: segment.labeled,
      deleted: segment.deleted
    });

    let cache = await AnalyticUnitCache.findById(analyticUnitId);
    const timeStep = cache.getTimeStep();
    let unit = await AnalyticUnit.findById(analyticUnitId);
    const detector = unit.detectorType;
    console.info(detector);
    console.info('from: ', segment.from, 'to: ', segment.to, 'timestep: ', timeStep );

    if(detector != 'pattern') {
      const intersectedWithLeftBound = await db.findMany({
        analyticUnitId,
        to: { $gte: segment.from - timeStep, $lte: segment.from },
        labeled: false,
        deleted: false
      });

      if (intersectedWithLeftBound.length > 0) {
        console.info(intersectedWithLeftBound);
        let leftSegment = intersectedWithLeftBound[0];
        segment.from = leftSegment.from;
      } else {
        console.info('intersectedWithLeftBound.length == 0');
      }

      const intersectedWithRightBound = await db.findMany({
        analyticUnitId,
        from: { $gte: segment.to, $lte: segment.to + timeStep },
        labeled: false,
        deleted: false
      });

      if (intersectedWithRightBound.length > 0) {
        console.info(intersectedWithRightBound);
        let rightSegment = intersectedWithRightBound[0];
        segment.to = rightSegment.to;
      } else {
        console.info('intersectedWithRightBound.length == 0');
      }
    }

    if(intersectedSegments.length > 0) {
      let from = _.minBy(intersectedSegments, 'from').from;
      let to = _.maxBy(intersectedSegments, 'to').to;
      let newSegment = Segment.fromObject(segment.toObject());
      newSegment.from = from;
      newSegment.to = to;
      segmentIdsToRemove = segmentIdsToRemove.concat(intersectedSegments.map(s => s._id));
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
