import { Collection, makeDBQ } from '../services/data_service';

import { Metric } from 'grafana-datasource-kit';

import * as _ from 'lodash';

let db = makeDBQ(Collection.ANALYTIC_UNITS);


export const ANALYTIC_UNIT_TYPES = {
  pattern: [
    {
      name: 'General',
      value: 'GENERAL'
    },
    {
      name: 'Peaks',
      value: 'PEAK'
    },
    {
      name: 'Troughs',
      value: 'TROUGH'
    },
    {
      name: 'Jumps',
      value: 'JUMP'
    },
    {
      name: 'Drops',
      value: 'DROP'
    }
  ],
  threshold: [
    {
      name: 'Threshold',
      value: 'THRESHOLD'
    }
  ]
};

export enum DetectorType {
  PATTERN = 'pattern',
  THRESHOLD = 'threshold'
};

export type AnalyticUnitId = string;
export enum AnalyticUnitStatus {
  READY = 'READY',
  PENDING = 'PENDING',
  LEARNING = 'LEARNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export type FindManyQuery = {
  name?: string,
  panelUrl?: string,
  type?: string,
  metric?: Metric,
  alert?: boolean,
  id?: AnalyticUnitId,
  lastDetectionTime?: number,
  status?: AnalyticUnitStatus,
  error?: string
};


export class AnalyticUnit {
  constructor(
    public name: string,
    public panelUrl: string,
    public type: string,
    public metric?: Metric,
    public alert?: boolean,
    public id?: AnalyticUnitId,
    public lastDetectionTime?: number,
    public status?: AnalyticUnitStatus,
    public error?: string
  ) {

    if(name === undefined) {
      throw new Error(`Missing field "name"`);
    }
    if(panelUrl === undefined) {
      throw new Error(`Missing field "panelUrl"`);
    }
    if(type === undefined) {
      throw new Error(`Missing field "type"`);
    }
  }

  public toObject() {
    let metric;
    if(this.metric !== undefined) {
      metric = this.metric.toObject();
    }

    return {
      _id: this.id,
      name: this.name,
      panelUrl: this.panelUrl,
      type: this.type,
      metric,
      alert: this.alert,
      lastDetectionTime: this.lastDetectionTime,
      status: this.status,
      error: this.error
    };
  }

  static fromObject(obj: any): AnalyticUnit {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    let metric: Metric;
    if(obj.metric !== undefined) {
      metric = Metric.fromObject(obj.metric);
    }
    return new AnalyticUnit(
      obj.name,
      obj.panelUrl,
      obj.type,
      metric,
      obj.alert,
      obj._id,
      obj.lastDetectionTime,
      obj.status as AnalyticUnitStatus,
      obj.error,
    );
  }

}


export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  let obj = await db.findOne(id);
  if(obj === null) {
    return null;
  }
  return AnalyticUnit.fromObject(obj);
}

export async function findMany(query: FindManyQuery): Promise<AnalyticUnit[]> {
  let analyticUnits = await db.findMany(query);
  if(analyticUnits === null) {
    return [];
  }
  return analyticUnits.map(AnalyticUnit.fromObject);
}


/**
 * Creates and updates new unit.id
 *
 * @param unit to create
 * @returns unit.id
 */
export async function create(unit: AnalyticUnit): Promise<AnalyticUnitId> {
  let obj = unit.toObject();
  return db.insertOne(obj);
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  // TODO: remove it`s segments
  // TODO: remove it`s cache
  // TODO: remove it`s views
  await db.removeOne(id);
}

export async function update(id: AnalyticUnitId, unit: AnalyticUnit) {
  return db.updateOne(id, unit);
}

export async function setStatus(id: AnalyticUnitId, status: string, error?: string) {
  return db.updateOne(id, { status, error });
}

export async function setDetectionTime(id: AnalyticUnitId, lastDetectionTime: number) {
  return db.updateOne(id, { lastDetectionTime });
}

export async function setAlert(id: AnalyticUnitId, alert: boolean) {
  return db.updateOne(id, { alert });
}

export async function setMetric(id: AnalyticUnitId, metric: Metric) {
  return db.updateOne(id, { metric });
}

export function getDetectorByType(analyticUnitType: string): DetectorType {
  let detector;
  _.forOwn(ANALYTIC_UNIT_TYPES, (types, detectorType) => {
    if(_.find(types, { value: analyticUnitType }) !== undefined) {
      detector = detectorType;
    }
  });

  if(detector === undefined) {
    throw new Error(`Can't find detector for analytic unit of type "${analyticUnitType}"`);
  }
  return detector;
}
