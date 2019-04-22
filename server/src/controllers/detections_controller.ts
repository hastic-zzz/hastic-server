import * as AnalyticsController from '../controllers/analytics_controller';
import * as AnalyticUnit from '../models/analytic_unit_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import { Detection, DetectionStatus } from '../models/detection_model';

import * as _ from 'lodash';

let runningDetections: Detection[] = [];

export async function getDetectionSpans(id, from: number, to: number): Promise<Detection[]> {

  const unitCache = await AnalyticUnitCache.findById(id);
  const intersection = unitCache.getIntersection();
  const intersectedDetections: Detection[] = getIntersectedRegions({id, from, to}, runningDetections);
  let rangesBorders: number[] = [];
  _.sortBy(intersectedDetections, 'from').map(d => {
    rangesBorders.push(d.from);
    rangesBorders.push(d.to);
  });
  insertToSorted(rangesBorders, from);
  insertToSorted(rangesBorders, to);

  let alreadyDetected = false;
  let startDetectionRange = null;
  let newDetectionRanges: any[] = [];

  for(let border of rangesBorders) {
    if(border === from) {
      if(!alreadyDetected) {
        startDetectionRange = from;
      }
      continue;
    }

    if(border === to) {
      if(!alreadyDetected) {
        newDetectionRanges.push({from: startDetectionRange, to});
      }
      break;
    }

    if(alreadyDetected) { //end of already detected region, start point for new detection
      startDetectionRange = border;
    } else { //end of new detection region
      newDetectionRanges.push({from: startDetectionRange, to});
    }
    alreadyDetected = !alreadyDetected;
  }

  if(newDetectionRanges.length === 0) {
    return [ new Detection(id, from, to, DetectionStatus.READY) ];
  } else {
    newDetectionRanges.map(d => {
      const intersectedFrom = Math.min(d.from - intersection, 0);
      const intersectedTo = d.to + intersection

      AnalyticsController.runDetect(id, intersectedFrom, intersectedTo)
      .then(() => _.find(runningDetections, {id, from, to})[0].status = DetectionStatus.READY)
      .catch(err => {
        console.error(err);
        _.find(runningDetections, {id, from, to})[0].state = DetectionStatus.FAILED;
      });
    });
  }

  let result: Detection[] = [];
  intersectedDetections.map(i => result.push(new Detection(i.id, i.from, i.from, DetectionStatus.READY)));
  newDetectionRanges.map(n => result.push(new Detection(n.id, n.from, n.from, DetectionStatus.RUNNING)));
  return result;
}

export function mergeDetecionSpan(id: AnalyticUnit.AnalyticUnitId, from: number, to: number) {

}

function getIntersectedRegions(range: any, ranges: any[], state?): any[] {
  const id = range.id
  const from = range.from;
  const to = range.to;
  if(state === undefined) {
    state = DetectionStatus.READY;
  }
  return ranges.filter(r => r.from <= to && r.to >= from && r.state === state && r.id === id);
}

function insertToSorted(array: number[], value: number) {
  return array.splice(_.sortedIndex(array, value), 0, value);
}
