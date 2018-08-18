import { AnalyticUnitId } from "./analytic_unit_model";


export type AnalyticsTaskId = string;
export enum AnalyticsTaskType { 
  LEARN = 'LEARN',
  PREDICT = 'PREDICT'
};

export class AnalyticsTask {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public type: AnalyticsTaskType,
    public payload?: any,
    public id?: AnalyticsTaskId
  ) {
    if(analyticUnitId === undefined) {
      throw new Error('analyticUnitId is undefined');
    }
    if(type === undefined || type === null) {
      throw new Error('type is undefined or null');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      type: this.type
    };
  }

  static fromObject(obj: any): AnalyticsTask {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new AnalyticsTask(
      obj.analyticUnitId,
      obj.type as AnalyticsTaskType,
      obj._id,
    );
  }
}
