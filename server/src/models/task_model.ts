import { AnalyticUnitId } from "./analytic_unit_model";


export type TaskId = string;

export class Task {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public id?: TaskId
  ) {
    if(analyticUnitId === undefined) {
      throw new Error('analyticUnitId is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId
    };
  }

  static fromObject(obj: any): Task {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Task(
      obj.analyticUnitId,
      obj._id,
    );
  }
}
