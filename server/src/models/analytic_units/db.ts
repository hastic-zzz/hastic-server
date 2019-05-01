import { createAnalyticUnitFromObject } from './utils';
import { AnalyticUnit } from './analytic_unit_model';
import { AnalyticUnitId, FindManyQuery } from './types';
import { Collection, makeDBQ, SortingOrder } from '../../services/data_service';

import { Metric } from 'grafana-datasource-kit';

import * as _ from 'lodash';


const db = makeDBQ(Collection.ANALYTIC_UNITS);

export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  let obj = await db.findOne(id);
  if (obj === null) {
    return null;
  }
  return createAnalyticUnitFromObject(obj);
}

export async function findMany(query: FindManyQuery): Promise<AnalyticUnit[]> {
  const analyticUnits = await db.findMany(query, {
    createdAt: SortingOrder.ASCENDING,
    name: SortingOrder.ASCENDING
  });
  if (analyticUnits === null) {
    return [];
  }
  return analyticUnits.map(createAnalyticUnitFromObject);
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

/**
 * Changes values of analytic unit fields to according values of obj
 *
 * @param id analytic unit id
 * @param obj object with keys and values which need to be updated in analytic unit
 */
export async function update(id: AnalyticUnitId, obj: any) {
  const analyticUnitObj = await db.findOne(id);
  if(analyticUnitObj === null) {
    throw new Error(`Analytic unit ${id} doesn't exist`);
  }

  const analyticUnit = createAnalyticUnitFromObject(analyticUnitObj);
  let updateObj: any = analyticUnit.toPanelObject();
  delete updateObj.id;
  updateObj = _.mapValues(updateObj, (value, key) => {
    if(_.has(obj, key)) {
      return obj[key];
    }
    return value;
  });

  return db.updateOne(id, updateObj);
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
