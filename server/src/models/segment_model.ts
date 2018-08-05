import { AnalyticUnitId } from './analytic_unit_model';

import { Collection, makeDBQ } from '../services/data_service';


import * as _ from 'lodash';

type SegmentId = string;

type Segment = {
  id?: SegmentId,
  from: number,
  to: number,
  labeled: boolean
}

let db = makeDBQ(Collection.SEGMENTS);

export function getLabeledSegments(id: AnalyticUnitId) {
  return 
}

export function getPredictedSegments(id: AnalyticUnitId) {

}

export function saveSegments(id: AnalyticUnitId, segments: Segment[]) {
  
}

export async function insertSegments(id: AnalyticUnitId, addedSegments: Segment[], labeled: boolean) {
}

export function removeSegments(idsToRemove: SegmentId[]) {
  
}
