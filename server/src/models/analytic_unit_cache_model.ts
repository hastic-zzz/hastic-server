import { AnalyticUnitId, AnalyticUnit } from './analytic_units';
import { Collection, makeDBQ } from '../services/data_service';

import * as _ from 'lodash';


const db = makeDBQ(Collection.ANALYTIC_UNIT_CACHES);
// TODO: count milliseconds in index from dataset
const MILLISECONDS_IN_INDEX = 60000;

export class AnalyticUnitCache {
  public constructor(
    public id: AnalyticUnitId,
    public data?: any
  ) {
    if(id === undefined) {
      throw new Error(`Missing field "id"`);
    }
  }

  public toObject() {
    return {
      data: this.data || null,
      _id: this.id
    };
  }

  static fromObject(obj: any): AnalyticUnitCache {
    return new AnalyticUnitCache(
      obj._id,
      obj.data,
    );
  }

  public getIntersection(): number {
    if(
        this.data !== undefined &&
        this.data !== null &&
        this.data.windowSize !== undefined
    ) {
      //TODO: return one window size after resolving https://github.com/hastic/hastic-server/issues/508
      if(this.data.timeStep !== undefined) {
        return this.data.windowSize * 2 * this.data.timeStep;
      } else {
        return this.data.windowSize * 2 * MILLISECONDS_IN_INDEX;
      }
    }
    // TODO: default window size
    return 3 * MILLISECONDS_IN_INDEX;
  }

  public getTimeStep(): number {
    return this.data.timeStep;
  }
}

export async function findById(id: AnalyticUnitId): Promise<AnalyticUnitCache | null> {
  console.log('findById', id);
  let obj = await db.findOne(id);
  console.log('obj', obj);
  if(obj === null) {
    return null;
  }
  return AnalyticUnitCache.fromObject(obj);
}

export async function create(id: AnalyticUnitId): Promise<AnalyticUnitId> {
  console.log('create', id);
  let cache = new AnalyticUnitCache(id);
  return db.insertOne(cache.toObject());
}

export async function setData(id: AnalyticUnitId, data: any) {
  return db.updateOne(id, { data });
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  await db.removeOne(id);
}
