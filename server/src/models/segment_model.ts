import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';

let db = makeDBQ(Collection.SEGMENTS);


type SegmentId = string;

export class Segment {
  constructor(
    public from: number,
    public to: number,
    public labeled: boolean,
    public id?: SegmentId
  ) {
    if(from === undefined) {
      throw new Error('from is undefined');
    }
    if(to === undefined) {
      throw new Error('to is undefined');
    }
    if(labeled === undefined) {
      throw new Error('labeled is undefined');
    }
  }

  public toObject() {
    return {
      _id: this.id,
      from: this.from,
      to: this.to,
      labeled: this.labeled
    };
  }

  static fromObject(obj: any): Segment {
    if(obj === undefined) {
      throw new Error('obj is undefined');
    }
    return new Segment(
      obj.from, obj.to,
      obj.labeled, obj.id || obj._id
    );
  }
}


export function getLabeledSegments(id: AnalyticUnitId) {
  //return db.
}

export function getPredicted(id: AnalyticUnitId) {

}

export async function insertSegments(id: any, segments: Segment[]) {
}

export function removeSegments(idsToRemove: SegmentId[]) {
  
}
