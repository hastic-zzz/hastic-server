//TODO: move this code to span model
import { DetectionSpan, DetectionStatus } from '../models/detection_model';

import * as _ from 'lodash';
import { AnalyticUnitId } from '../models/analytic_unit_model';

export declare type Span = {
  from: number,
  to: number
}

export function insertToSorted(array: number[], value: number) {
  array.splice(_.sortedIndex(array, value), 0, value);
}

export function getNonIntersectedSpans(from: number, to: number, spanBorders: number[]): Span[] {
  let alreadyDetected = false;
  let startDetectionRange = null;
  let result: Span[] = [];

  for(let border of spanBorders) {
    if(border === from) {
      if(!alreadyDetected) {
        startDetectionRange = from;
      }
      continue;
    }

    if(border === to) {
      if(!alreadyDetected) {
        result.push({from: startDetectionRange, to});
      }
      break;
    }

    if(alreadyDetected) { //end of already detected region, start point for new detection
      startDetectionRange = border;
    } else { //end of new detection region
      result.push({from: startDetectionRange, to});
    }
    alreadyDetected = !alreadyDetected;
  }

  return result;
}
