import { DetectorType, ANALYTIC_UNIT_TYPES } from './types';
import { AnalyticUnit } from './analytic_unit_model';
import { PatternAnalyticUnit } from './pattern_analytic_unit_model';
import { AnomalyAnalyticUnit } from './anomaly_analytic_unit_model';
import { ThresholdAnalyticUnit } from './threshold_analytic_unit_model';

import * as _ from 'lodash';


export function createAnalyticUnitFromObject(obj: any): AnalyticUnit {
  if (obj === undefined) {
    throw new Error('obj is undefined');
  }

  const detectorType: DetectorType = obj.detectorType;
  switch (detectorType) {
    case DetectorType.PATTERN:
      return PatternAnalyticUnit.fromObject(obj);
    case DetectorType.ANOMALY:
      return AnomalyAnalyticUnit.fromObject(obj)
    case DetectorType.THRESHOLD:
      return ThresholdAnalyticUnit.fromObject(obj);

    default:
      throw new Error(`Can't create analytic unit with type "${detectorType}"`);
  }
}

export function getDetectorByType(analyticUnitType: string): DetectorType {
  let detector;
  _.forOwn(ANALYTIC_UNIT_TYPES, (types, detectorType) => {
    if(_.find(types, { value: analyticUnitType }) !== undefined) {
      detector = detectorType;
    }
  });

  if(detector === undefined) {
    throw new Error(`Can't find detector for analytic unit of type "${analyticUnitType}"`);
  }
  return detector;
}
