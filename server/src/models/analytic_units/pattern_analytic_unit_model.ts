import { AnalyticUnit } from './analytic_unit_model';
import { AnalyticUnitId, AnalyticUnitStatus, DetectorType } from './types';

import { Metric } from 'grafana-datasource-kit';


export class PatternAnalyticUnit extends AnalyticUnit {
  constructor(
    name: string,
    grafanaUrl: string,
    panelId: string,
    type: string,
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
      DetectorType.PATTERN,
      visible,
      collapsed
    );
  }

  toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject
    };
  }

  toPanelObject() {
    const baseObject = super.toPanelObject();
    return {
      ...baseObject
    };
  }

  static fromObject(obj: any) {
    // TODO: remove duplication
    let metric: Metric;
    if(obj.metric !== undefined) {
      metric = Metric.fromObject(obj.metric);
    }

    return new PatternAnalyticUnit(
      obj.name,
      obj.grafanaUrl,
      obj.panelId,
      obj.type,
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
