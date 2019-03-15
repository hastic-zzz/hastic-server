import { Collection, makeDBQ } from '../services/data_service';

import { AnalyticUnitId, DetectorType } from './analytic_unit_model';

let db = makeDBQ(Collection.ANALYTIC_UNIT_VIEWS);

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

export async function findById(id: AnalyticUnitId): Promise<AnalyticUnitView> {
  const obj = await db.findOne(id);
  if(obj === null) {
    return null;
  }
  return AnalyticUnitView.fromObject(obj);
}

export async function create(analyticUnitView: any): Promise<AnalyticUnitId> {
  const obj = AnalyticUnitView.fromObject(analyticUnitView);
  return db.insertOne(obj);
}

export async function update(id: AnalyticUnitId, analyticUnitView: AnalyticUnitView) {
  return db.updateOne(id, analyticUnitView);
}

export async function remove(id: AnalyticUnitId): Promise<void> {
  await db.removeOne(id);
}
