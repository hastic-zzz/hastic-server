import { AnalyticUnit } from './analytic_unit_model';
import { AnalyticUnitId, AnalyticUnitStatus, DetectorType } from './types';

import { Metric } from 'grafana-datasource-kit';


export class AnomalyAnalyticUnit extends AnalyticUnit {
  constructor(
    name: string,
    grafanaUrl: string,
    panelId: string,
    type: string,
    public alpha: number,
    public confidence: number,
    metric?: Metric,
    alert?: boolean,
    id?: AnalyticUnitId,
    lastDetectionTime?: number,
    status?: AnalyticUnitStatus,
    error?: string,
    labeledColor?: string,
    deletedColor?: string,
    visible?: boolean
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
      visible
    );
  }

  toObject() {
    const baseObject = super.toObject();
    return {
      ...baseObject,
      alpha: this.alpha,
      confidence: this.confidence
    };
  }

  toPanelObject() {
    const baseObject = super.toPanelObject();
    return {
      ...baseObject,
      alpha: this.alpha,
      confidence: this.confidence
    };
  }

  static fromObject(obj: any) {
    // TODO: remove duplication
    let metric: Metric;
    if (obj.metric !== undefined) {
      metric = Metric.fromObject(obj.metric);
    }

    return new AnomalyAnalyticUnit(
      obj.name,
      obj.grafanaUrl,
      obj.panelId,
      obj.type,
      obj.alpha,
      obj.confidence,
      metric,
      obj.alert,
      obj._id,
      obj.lastDetectionTime,
      obj.status,
      obj.error,
      obj.labeledColor,
      obj.deletedColor,
      obj.visible
    );
  }
}