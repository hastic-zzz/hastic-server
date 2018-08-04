import { Metric, metricFromObj } from './metric_model';
import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.ANALYTIC_UNITS);



export type AnalyticUnitId = string;

export type AnalyticUnit = {
  id?: AnalyticUnitId,
  name: string,
  panelUrl: string,
  type: string,
  metric: Metric
  status: string,
  error?: string,
  lastPredictionTime: number,
  nextId: number
}


export function analyticUnitFromObj(obj: any): AnalyticUnit {
  if(obj === undefined) {
    throw new Error('obj is undefined');
  }
  if(obj.type === undefined) {
    throw new Error(`Missing field "type"`);
  }
  if(obj.name === undefined) {
    throw new Error(`Missing field "name"`);
  }
  if(obj.panelUrl === undefined) {
    throw new Error(`Missing field "panelUrl"`);
  }
  if(obj.metric === undefined) {
    throw new Error(`Missing field "datasource"`);
  }
  if(obj.metric.datasource === undefined) {
    throw new Error(`Missing field "metric.datasource"`);
  }
  if(obj.metric.targets === undefined) {
    throw new Error(`Missing field "metric.targets"`);
  }

  const unit: AnalyticUnit = {
    name: obj.name,
    panelUrl: obj.panelUrl,
    type: obj.type,
    datasource: obj.datasource,
    metric: metric,
    status: 'LEARNING',
    lastPredictionTime: 0,
    nextId: 0
  };

  return unit;
}

export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  return db.findOne(id);
}

export async function create(unit: AnalyticUnit): Promise<AnalyticUnitId> {
  return db.insert(unit);
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  await db.remove(id);
  return;
}

export async function update(id: AnalyticUnitId, unit: AnalyticUnit) {
  return db.update(id, unit);
}

export async function setStatus(id: AnalyticUnitId, status: string, error?: string) {
  return db.update(id, { status, error });
}

export async function setPredictionTime(id: AnalyticUnitId, lastPredictionTime: number) {
  return db.update(id, { lastPredictionTime });
}
