import { AnalyticUnitId, AnalyticUnitStatus, DetectorType } from './types';

import { Metric } from 'grafana-datasource-kit';


export abstract class AnalyticUnit {

  public learningAfterUpdateRequired = false;

  constructor(
    public name: string,
    public grafanaUrl: string,
    public panelId: string,
    // TODO: enum type
    // TODO: type -> subType
    public type: string,
    public metric?: Metric,
    public alert?: boolean,
    public id?: AnalyticUnitId,
    public lastDetectionTime?: number,
    public status?: AnalyticUnitStatus,
    public error?: string,
    public labeledColor?: string,
    public deletedColor?: string,
    // TODO: detectorType -> type
    public detectorType?: DetectorType,
    public visible?: boolean,
    public collapsed?: boolean
  ) {

    if(name === undefined) {
      throw new Error(`Missing field "name"`);
    }
    if(grafanaUrl === undefined) {
      throw new Error(`Missing field "grafanaUrl"`);
    }
    if(type === undefined) {
      throw new Error(`Missing field "type"`);
    }
  }

  public toObject() {
    let metric;
    if(this.metric !== undefined) {
      metric = this.metric.toObject();
    }

    return {
      _id: this.id,
      name: this.name,
      grafanaUrl: this.grafanaUrl,
      panelId: this.panelId,
      type: this.type,
      metric,
      alert: this.alert,
      lastDetectionTime: this.lastDetectionTime,
      status: this.status,
      error: this.error,
      labeledColor: this.labeledColor,
      deletedColor: this.deletedColor,
      detectorType: this.detectorType,
      visible: this.visible,
      collapsed: this.collapsed
    };
  }

  public toPanelObject() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      alert: this.alert,
      labeledColor: this.labeledColor,
      deletedColor: this.deletedColor,
      detectorType: this.detectorType,
      visible: this.visible,
      collapsed: this.collapsed
    };
  }

}
