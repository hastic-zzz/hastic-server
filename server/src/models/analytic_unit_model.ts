import { Collection, makeDBQ } from '../services/data_service';

import { Metric } from 'grafana-datasource-kit';


let db = makeDBQ(Collection.ANALYTIC_UNITS);


export type AnalyticUnitId = string;
export enum AnalyticUnitStatus {
  READY = 'READY',
  PENDING = 'PENDING',
  LEARNING = 'LEARNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export class AnalyticUnit {
  constructor(
    public name: string,
    public panelUrl: string,
    public type: string,
    public metric: Metric,
    public id?: AnalyticUnitId,
    public lastDetectionTime?: number,
    public status?: AnalyticUnitStatus,
    public error?: string,
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
    if(metric === undefined) {
      throw new Error(`Missing field "metric"`);
    }
  }

  public toObject() {
    return {
      _id: this.id,
      name: this.name,
      panelUrl: this.panelUrl,
      type: this.type,
      metric: this.metric.toObject(),
      lastDetectionTime: this.lastDetectionTime,
      status: this.status,
      error: this.error
    };
  }

  static fromObject(obj: any): AnalyticUnit {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new AnalyticUnit(
      obj.name,
      obj.panelUrl,
      obj.type,
      Metric.fromObject(obj.metric),
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
