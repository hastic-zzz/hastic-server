import { Metric } from './metric_model';
import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.ANALYTIC_UNITS);


export type AnalyticUnitId = string;

export class AnalyticUnit {
  constructor(
    public name: string,
    public panelUrl: string,
    public type: string,
    public metric: Metric,
    public id?: AnalyticUnitId,
    public lastPredictionTime?: number,
    public status?: string,
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
      Metric.fromObject(obj.metric),
      obj.status,
      obj.lastPredictionTime,
      obj._id,
      obj.error,
    );
  }

}


export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  return AnalyticUnit.fromObject(await db.findOne(id));
}

/**
 * Creates and updates new unit.id
 *
 * @param unit to create
 * @returns unit.id
 */
export async function create(unit: AnalyticUnit): Promise<AnalyticUnitId> {
  var obj = unit.toObject();
  var r = await db.insertOne(obj);
  return r;
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  await db.removeOne(id);
  return;
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
