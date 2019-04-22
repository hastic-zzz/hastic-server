import { AnalyticUnitId } from './analytic_unit_model';
import { Collection, makeDBQ } from '../services/data_service';

import * as _ from 'lodash';

let db = makeDBQ(Collection.DETECTION_STATUS);

export enum DetectionStatus {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED'
}

export type DetectionId = string;

export class Detection {
  constructor(
    public analyticUnitId: AnalyticUnitId,
    public from: number,
    public to: number,
    public status: DetectionStatus,
    public id?: DetectionId,
  ) {
    if(analyticUnitId === undefined) {
      throw new Error('AnalyticUnitId is undefined');
    }
    if(from === undefined) {
      throw new Error('from is undefined');
    }
    if(isNaN(from)) {
      throw new Error('from is NaN');
    }
    if(to === undefined) {
      throw new Error('to is undefined');
    }
    if(isNaN(to)) {
      throw new Error('to is NaN');
    }
    if(status === undefined) {
      throw new Error('status is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      analyticUnitId: this.analyticUnitId,
      from: this.from,
      to: this.to
    };
  }

  static fromObject(obj: any): Detection {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Detection(
      obj.analyticUnitId,
      +obj.from, +obj.to, obj._id
    );
  }
}
