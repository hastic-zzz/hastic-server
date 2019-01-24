import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';

import * as _ from 'lodash';

let db = makeDBQ(Collection.THRESHOLD);


export enum Condition {
  ABOVE = '>',
  ABOVE_OR_EQUAL = '>=',
  EQUAL = '=',
  LESS_OR_EQUAL = '<=',
  LESS = '<'
};

export class Threshold {
  constructor(
    public id: AnalyticUnitId,
    public value: number,
    public condition: Condition
  ) {
    if(id === undefined) {
      throw new Error('id is undefined');
    }
    if(value === undefined) {
      throw new Error('condition is undefined');
    }
    if(condition === undefined) {
      throw new Error('condition is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      value: this.value,
      condition: this.condition
    };
  }

  static fromObject(obj: any): Threshold {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Threshold(obj._id, +obj.value, obj.condition);
  }
}

export async function findOne(id: AnalyticUnitId): Promise<Threshold | null> {
  const threshold = await db.findOne(id);
  if(threshold === null) {
    return null;
  }
  return Threshold.fromObject(threshold);
}

export async function updateThreshold(id: AnalyticUnitId, value: number, condition: Condition) {
  const threshold = await db.findOne(id);
  if(threshold === null) {
    return db.insertOne(threshold.toObject());
  }
  return db.updateOne({ _id: id }, { value, condition });
}

export async function removeThreshold(id: AnalyticUnitId) {
  return db.removeOne(id);
}
