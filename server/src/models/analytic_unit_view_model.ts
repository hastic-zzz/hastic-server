import { AnalyticUnitId, DetectorType } from './analytic_unit_model';

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
