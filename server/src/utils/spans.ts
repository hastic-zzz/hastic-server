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
  let isFromProcessed = false;
  let alreadyDetected = false;
  let startDetectionRange = null;
  let result: Span[] = [];

  for(var border of spanBorders) {
    if(!isFromProcessed && border >= from) {
      isFromProcessed = true;
      if(border === from) {
        if(alreadyDetected) {
          startDetectionRange = from;
        }
      } else {
          if(!alreadyDetected) {
          startDetectionRange = from;
        }
      }
    }

    if(border >= to) {
      if(!alreadyDetected) {
        result.push({from: startDetectionRange, to});
      }
      break;
    }

    if(alreadyDetected) { //end of already detected region, start point for new detection
      startDetectionRange = border;
    } else { //end of new detection region
      if(startDetectionRange !== null) {
        result.push({from: startDetectionRange, to: border});
      }
    }
    alreadyDetected = !alreadyDetected;
  }

  if(border < to) {
    result.push({from: startDetectionRange, to});
  }

  return result;
}
