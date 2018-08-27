import { GrafanaMetric } from './grafana_metric_model';
import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.ANALYTIC_UNITS);


export type AnalyticUnitId = string;
export enum AnalyticUnitStatus {
  LEARNING = 'LEARNING',
  SUCCESS = 'SUCCESS',
  READY = 'READY',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export class AnalyticUnit {
  constructor(
    public name: string,
    public panelUrl: string,
    public type: string,
    public metric: GrafanaMetric,
    public id?: AnalyticUnitId,
    public lastPredictionTime?: number,
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
      lastPredictionTime: this.lastPredictionTime,
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
      GrafanaMetric.fromObject(obj.metric),
      obj._id,
      obj.lastPredictionTime,
      obj.status as AnalyticUnitStatus,
      obj.error,
    );
  }

}


export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  let obj = await db.findOne(id);
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
  await db.removeOne(id);
}

export async function update(id: AnalyticUnitId, unit: AnalyticUnit) {
  return db.updateOne(id, unit);
}

export async function setStatus(id: AnalyticUnitId, status: string, error?: string) {
  return db.updateOne(id, { status, error });
}

export async function setPredictionTime(id: AnalyticUnitId, lastPredictionTime: number) {
  return db.updateOne(id, { lastPredictionTime });
}
