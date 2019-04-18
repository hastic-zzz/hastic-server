import { AnalyticUnitId } from "./analytic_unit_model";
import { Collection, makeDBQ } from '../services/data_service';


let db = makeDBQ(Collection.ANALYTIC_UNIT_CACHES);


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
}

export async function findById(id: AnalyticUnitId): Promise<AnalyticUnitCache> {
  let obj = await db.findOne(id);
  if(obj === null) {
    return null;
  }
  return AnalyticUnitCache.fromObject(obj);
}

export async function getAllCaches(): Promise<AnalyticUnitCache[]> {
  const caches = await db.findMany({
    id: { $gt: '' }
  });
  return caches.map(obj => AnalyticUnitCache.fromObject(obj));
}

export async function create(id: AnalyticUnitId): Promise<AnalyticUnitId> {
  let cache = new AnalyticUnitCache(id);
  return db.insertOne(cache.toObject());
}

export async function setData(id: AnalyticUnitId, data: any) {
  return db.updateOne(id, { data });
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  await db.removeOne(id);
}
