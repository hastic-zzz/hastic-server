import { AnalyticUnitId } from './analytic_units';
import { Collection, makeDBQ } from '../services/data_service';

import * as _ from 'lodash';

let db = makeDBQ(Collection.DETECTION_SPANS);

export enum DetectionStatus {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED'
}

export type SpanId = string;

/**
 * Detection-span represents the state of dataset segment:
 * - READY: detection is done
 * - RUNNING: detection is running
 * - FAILED: detection failed
 */
export class DetectionSpan {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public from: number,
    public to: number,
    public status: DetectionStatus,
    public id?: SpanId,
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
    if(status === undefined) {
      throw new Error('status is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      from: this.from,
      to: this.to,
      status: this.status
    };
  }

  static fromObject(obj: any): DetectionSpan {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new DetectionSpan(
      obj.analyticUnitId,
      +obj.from, +obj.to,
      obj.status,
      obj._id
    );
  }
}

export type FindManyQuery = {
  status?: DetectionStatus,
  // TODO:
  // from?: { $gte?: number, $lte?: number }
  // to?: { $gte?: number, $lte?: number }
  timeFromLTE?: number,
  timeToGTE?: number,
  timeFromGTE?: number,
  timeToLTE?: number,
}

export async function findMany(id: AnalyticUnitId, query?: FindManyQuery): Promise<DetectionSpan[]> {
  let dbQuery: any = { analyticUnitId: id };
  if(query.status !== undefined) {
    dbQuery.status = query.status;
  }
  if(query.timeFromLTE !== undefined) {
    dbQuery.from = { $lte: query.timeFromLTE };
  }
  if(query.timeToGTE !== undefined) {
    dbQuery.to = { $gte: query.timeToGTE };
  }
  if(query.timeFromGTE !== undefined) {
    dbQuery.from = { $gte: query.timeFromGTE };
  }
  if(query.timeToLTE !== undefined) {
    dbQuery.to = { $lte: query.timeToLTE };
  }

  const spans = await db.findMany(dbQuery);
  if(spans === null) {
    return [];
  }
  return spans.map(DetectionSpan.fromObject);
}

// TODO: maybe it could have a better name
export async function findByAnalyticUnitIds(analyticUnitIds: AnalyticUnitId[]): Promise<DetectionSpan[]> {
  const spans = await db.findMany({ analyticUnitId: { $in: analyticUnitIds } });

  if(spans === null) {
    return [];
  }
  return spans.map(DetectionSpan.fromObject);
}

export async function getIntersectedSpans(
  analyticUnitId: AnalyticUnitId,
  from: number,
  to: number,
  status?: DetectionStatus
): Promise<DetectionSpan[]> {
  return findMany(analyticUnitId, { status, timeFromLTE: to, timeToGTE: from });
}

export async function insertSpan(span: DetectionSpan): Promise<SpanId> {
  let spanToInsert = span.toObject();

  const intersections = await getIntersectedSpans(span.analyticUnitId, span.from, span.to);
  if(_.isEmpty(intersections)) {
    return db.insertOne(spanToInsert);
  }
  const spansWithSameStatus = intersections.filter(
    intersectedSpan => intersectedSpan.status === span.status
  );

  let from = span.from;
  let to = span.to;

  if(!_.isEmpty(spansWithSameStatus)) {
    let minFrom = _.minBy(spansWithSameStatus, s => s.from).from;
    from = Math.min(from, minFrom);

    let maxTo = _.maxBy(spansWithSameStatus, s => s.to).to;
    to = Math.max(to, maxTo);
  }

  const spansInside = intersections.filter(
    intersectedSpan => intersectedSpan.from >= span.from && intersectedSpan.to <= span.to
  );
  const spanIdsToRemove = _.concat(
    spansWithSameStatus.map(s => s.id),
    spansInside.map(s => s.id)
  );

  await db.removeMany(spanIdsToRemove);

  spanToInsert = new DetectionSpan(span.analyticUnitId, from, to, span.status).toObject();

  return db.insertOne(spanToInsert);
}

export async function insertMany(detectionSpans: any[]): Promise<SpanId[]> {
  return db.insertMany(detectionSpans);
}

export function clearSpans(analyticUnitId: AnalyticUnitId) {
  return db.removeMany({ analyticUnitId });
}
