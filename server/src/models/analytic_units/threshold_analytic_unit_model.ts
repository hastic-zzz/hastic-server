import { AnalyticUnit } from './analytic_unit_model';
import { AnalyticUnitId, AnalyticUnitStatus, DetectorType } from './types';

import { Metric } from 'grafana-datasource-kit';


export enum Condition {
  ABOVE = '>',
  ABOVE_OR_EQUAL = '>=',
  EQUAL = '=',
  LESS_OR_EQUAL = '<=',
  LESS = '<',
  NO_DATA = 'NO_DATA'
};

export class ThresholdAnalyticUnit extends AnalyticUnit {

  public learningAfterUpdateRequired = true;

  constructor(
    name: string,
    grafanaUrl: string,
    panelId: string,
    type: string,
    public value: number,
    public condition: Condition,
    metric?: Metric,
    alert?: boolean,
    id?: AnalyticUnitId,
    lastDetectionTime?: number,
    status?: AnalyticUnitStatus,
    error?: string,
    labeledColor?: string,
    deletedColor?: string,
    visible?: boolean,
    collapsed?: boolean
  ) {
    super(
      name,
      grafanaUrl,
      panelId,
      type,
      metric,
      alert,
      id,
      lastDetectionTime,
      status,
      error,
      labeledColor,
      deletedColor,
      DetectorType.THRESHOLD,
      visible,
      collapsed
    );
  }

  toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      value: this.value,
      condition: this.condition
    };
  }

  toPanelObject() {
    const baseObject = super.toPanelObject();
    return {
      ...baseObject,
      value: this.value,
      condition: this.condition
    };
  }

  static fromObject(obj: any) {
    // TODO: remove duplication
    let metric: Metric;
    if (obj.metric !== undefined) {
      metric = Metric.fromObject(obj.metric);
    }

    return new ThresholdAnalyticUnit(
      obj.name,
      obj.grafanaUrl,
      obj.panelId,
      obj.type,
      obj.value,
      obj.condition,
      metric,
      obj.alert,
      obj._id,
      obj.lastDetectionTime,
      obj.status,
      obj.error,
      obj.labeledColor,
      obj.deletedColor,
      obj.visible,
      obj.collapsed
    );
  }
}
