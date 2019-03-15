import { Collection, makeDBQ } from '../services/data_service';

import { AnalyticUnitId, DetectorType } from './analytic_unit_model';

let db = makeDBQ(Collection.ANALYTIC_UNITS);

export class AnalyticUnitView {
  constructor(
    public id: AnalyticUnitId,
    public labeledColor: string,
    public deletedColor: string,
    public detectorType: DetectorType,
    public visible: boolean
  ) {}

  public toObject() {
    return {
      _id: this.id,
      labeledColor: this.labeledColor,
      deletedColor: this.deletedColor,
      detectorType: this.detectorType,
      visible: this.visible
    };
  }

  static fromObject(obj: any): AnalyticUnitView {
    return new AnalyticUnitView(
      obj._id,
      obj.labeledColor,
      obj.deletedColor,
      obj.detectorType,
      obj.visible
    );
  }
}

export async function create(analyticUnitView: AnalyticUnitView): Promise<AnalyticUnitId> {
  let obj = analyticUnitView.toObject();
  return db.insertOne(obj);
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  // TODO: remove it`s segments
  // TODO: remove it`s cache
  await db.removeOne(id);
}
