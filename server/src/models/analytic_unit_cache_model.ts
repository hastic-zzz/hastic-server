import { AnalyticUnitId } from "./analytic_unit_model";
import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.ANALYTIC_UNIT_CACHES);


export type AnalyticUnitCacheId = string;

export class AnalyticUnitCache {
  public constructor(
    public analyticUnitId: AnalyticUnitId,
    public data: any,
    public id?: AnalyticUnitCacheId,
  ) {

  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      data: this.data
    };
  }

  static fromObject(obj: any): AnalyticUnitCache {
    if(obj.method === undefined) {
      throw new Error('No method in obj:' + obj);
    }
    return new AnalyticUnitCache(
      obj.method,
      obj.data,
      obj._id
    );
  }
}

export async function findById(id: AnalyticUnitCacheId): Promise<AnalyticUnitCache> {
  let obj = await db.findOne(id);
  return AnalyticUnitCache.fromObject(obj);
}

export async function create(unit: AnalyticUnitCache): Promise<AnalyticUnitCacheId> {
  let obj = unit.toObject();
  return db.insertOne(obj);
}

export async function setData(id: AnalyticUnitCacheId, data: any) {
  return db.updateOne(id, { data });
}

export async function remove(id: AnalyticUnitCacheId): Promise<void> {
  await db.removeOne(id);
}
