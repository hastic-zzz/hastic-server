import { AnalyticUnitId } from "./analytic_unit_model";

import { uid } from "../utils/uid";


const UID_LENGTH = 16;

export type AnalyticsTaskId = string;
export enum AnalyticsTaskType { 
  LEARN = 'LEARN',
  DETECT = 'DETECT',
  CANCEL = 'CANCEL'
};

export class AnalyticsTask {

  constructor(
    public analyticUnitId: AnalyticUnitId,
    public type: AnalyticsTaskType,
    public payload?: any,
    private _id?: AnalyticsTaskId
  ) {
    if(analyticUnitId === undefined) {
      throw new Error('analyticUnitId is undefined');
    }
    if(type === undefined || type === null) {
      throw new Error('type is undefined or null');
    }
    
  }

  public get id(): AnalyticsTaskId {
    if(this._id === undefined) {
      this._id = uid(UID_LENGTH);
    }
    return this._id;
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      type: this.type,
      payload: this.payload
    };
  }

  static fromObject(obj: any): AnalyticsTask {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new AnalyticsTask(
      obj.analyticUnitId,
      obj.type as AnalyticsTaskType,
      obj.payload,
      obj._id,
    );
  }
}
