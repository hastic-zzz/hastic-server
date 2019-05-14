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
  return getClassByDetectorType(detectorType).fromObject(obj);
}

export function getClassByDetectorType(detectorType: DetectorType): AnalyticUnit {
  switch (detectorType) {
    case DetectorType.PATTERN:
      return PatternAnalyticUnit;
    case DetectorType.ANOMALY:
      return AnomalyAnalyticUnit;
    case DetectorType.THRESHOLD:
      return ThresholdAnalyticUnit;

    default:
      throw new Error(`Unsupported detector type "${detectorType}"`);
}
