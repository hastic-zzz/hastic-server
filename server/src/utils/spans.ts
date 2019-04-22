import { Detection, DetectionStatus } from '../models/detection_model';

import * as _ from 'lodash';

export function insertToSorted(array: number[], value: number) {
  return array.splice(_.sortedIndex(array, value), 0, value);
}

export function getIntersectedDetections(detection: Detection, detections: Detection[], status?: DetectionStatus): Detection[] {
  if(status === undefined) {
    status = DetectionStatus.READY;
  }
  return detections.filter(d => {
    return d.from <= detection.to &&
      d.to >= detection.from &&
        d.status === status &&
          d.analyticUnitId === detection.analyticUnitId
  });
}
