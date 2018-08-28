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
      analyticUnitId: self.analyticUnitId,
      data: self.data,
      obj._id
    };
  }

  static fromObject(obj: any): AnalyticUnitCache {
    if(obj.method === undefined) {
      throw new Error('No method in obj:' + obj);
    }
    return new AnalyticUnitCache(obj.method, obj.data);
  }
}
