import { sendNotification, InfoMeta, AnalyticMeta, WebhookType, Notification } from './notification_service';

import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_units';
import { Segment } from '../models/segment_model';
import { availableReporter } from '../utils/reporter';
import { ORG_ID } from '../config';


export class Alert {
  public enabled = true;
  constructor(protected analyticUnit: AnalyticUnit.AnalyticUnit) {};
  public receive(segment: Segment) {
    if(this.enabled) {
      sendNotification(this.makeNotification(segment));
    }
  };

  protected makeNotification(segment: Segment): Notification {
    const meta = this.makeMeta(segment);
    const message = this.makeMessage(meta);
    return { meta, message };
  }

  protected makeMeta(segment: Segment): AnalyticMeta {
    const datshdoardId = this.analyticUnit.panelId.split('/')[0];
    const panelId = this.analyticUnit.panelId.split('/')[1];
    const grafanaUrl = `${this.analyticUnit.grafanaUrl}/d/${datshdoardId}?panelId=${panelId}&edit=true&fullscreen=true?orgId=${ORG_ID}`;
    const alert: AnalyticMeta = {
      type: WebhookType.DETECT,
      analyticUnitType: this.analyticUnit.type,
      analyticUnitName: this.analyticUnit.name,
      analyticUnitId: this.analyticUnit.id,
      grafanaUrl,
      from: segment.from,
      to: segment.to 
    };

    return alert;
  }

  protected makeMessage(meta: AnalyticMeta): string {
    return [
    `[${meta.analyticUnitType.toUpperCase()} ALERTING] ${meta.analyticUnitName}`,
    `URL: ${meta.grafanaUrl}`,
    ``,
    `From: ${new Date(meta.from)}`,
    `To: ${new Date(meta.to)}`,
    `ID: ${meta.analyticUnitId}`
    ].join('\n');
  }
}

class PatternAlert extends Alert {

  private lastSentSegment: Segment;

  public receive(segment: Segment) {
    if(this.lastSentSegment === undefined || !segment.equals(this.lastSentSegment) ) {
      this.lastSentSegment = segment;
      if(this.enabled) {
        sendNotification(this.makeNotification(segment));
      }
    }
  }

  protected makeMessage(meta: AnalyticMeta): string {
    return [
    `[PATTERN DETECTED] ${meta.analyticUnitName}`,
    `URL: ${meta.grafanaUrl}`,
    ``,
    `From: ${new Date(meta.from)}`,
    `To: ${new Date(meta.to)}`,
    `ID: ${meta.analyticUnitId}`
    ].join('\n');
  }
};


class ThresholdAlert extends Alert {
  // TODO: configure threshold timing in panel like Grafana's alerts (`evaluate` time, `for` time)
  // TODO: make events for starn and end of treshold
  EXPIRE_PERIOD_MS = 60000;
  lastOccurence = 0;

  public receive(segment: Segment) {
    if(this.lastOccurence === 0) {
      this.lastOccurence = segment.from;
      if(this.enabled) {
        sendNotification(this.makeNotification(segment));
      }
    } else {

      if(segment.from - this.lastOccurence > this.EXPIRE_PERIOD_MS) {
        if(this.enabled) {
          console.log(`time between threshold occurences ${segment.from - this.lastOccurence}ms, send alert`);
          sendNotification(this.makeNotification(segment));
        }
      }

      this.lastOccurence = segment.from;
    }
  }

  protected makeMessage(meta: AnalyticMeta): string {
    let message = [
    `[TRESHOLD ALERTING] ${meta.analyticUnitName}`,
    `URL: ${meta.grafanaUrl}`,
    ``,
    `Starts at: ${new Date(meta.from)}`,
    `ID: ${meta.analyticUnitId}`
    ].join('\n');

    if(meta.params !== undefined) {
      const metrics = `
      Metrics:
      ${this.analyticUnit.metric.targets[0].expr}: ${meta.params.value}
      `;
      message += metrics;
    }
    return message;
  }
}


export class AlertService {

  private _alerts: { [id: string]: Alert };
  private _alertingEnable: boolean;
  private _grafanaAvailableReporter: Function;
  private _datasourceAvailableReporters: Map<string, Function>;

  constructor() {
    this._alerts = {};
    this._datasourceAvailableReporters = new Map();

    this._grafanaAvailableReporter = availableReporter(
      ['[OK] Grafana available', WebhookType.RECOVERY],
      ['[FAILURE] Grafana unavailable for pulling data', WebhookType.FAILURE],
      this.sendMsg,
      this.sendMsg
    );
  }

  public receiveAlert(analyticUnit: AnalyticUnit.AnalyticUnit, segment: Segment) {
    if(!this._alertingEnable) {
      return;
    }

    let id = analyticUnit.id;

    if(!_.has(this._alerts, id)) {
      this.addAnalyticUnit(analyticUnit);
    }

    this._alerts[id].receive(segment);
  };

  public sendMsg(message: string, type: WebhookType, optionalInfo = {}) {
    const now = Date.now();
    const infoAlert: InfoMeta = {
      params: optionalInfo,
      type,
      from: now,
      to: now
    }
    sendNotification({ message, meta: infoAlert });
  }

  public sendGrafanaAvailableWebhook() {
    this._grafanaAvailableReporter(true);
  }
  
  public sendGrafanaUnavailableWebhook() {
    this._grafanaAvailableReporter(false);
  }

  public sendDatasourceAvailableWebhook(url: string) {
    const reporter = this._getDatasourceAvailableReporter(url);
    reporter(true);
  }

  public sendDatasourceUnavailableWebhook(url: string) {
    const reporter = this._getDatasourceAvailableReporter(url);
    reporter(false);
  }

  public addAnalyticUnit(analyticUnit: AnalyticUnit.AnalyticUnit) {
    let alertsType = {};

    alertsType[AnalyticUnit.DetectorType.THRESHOLD] = ThresholdAlert;
    alertsType[AnalyticUnit.DetectorType.PATTERN] = PatternAlert;
    alertsType[AnalyticUnit.DetectorType.ANOMALY] = Alert;

    this._alerts[analyticUnit.id] = new alertsType[analyticUnit.detectorType](analyticUnit);
  }

  public removeAnalyticUnit(analyticUnitId: AnalyticUnit.AnalyticUnitId) {
    delete this._alerts[analyticUnitId];
  }

  public stopAlerting() {
    this._alertingEnable = false;
  }

  public startAlerting() {
    this._alertingEnable = true;
  }

  private _getDatasourceAvailableReporter(url: string) {
    if(!_.has(this._datasourceAvailableReporters, url)) {
      this._datasourceAvailableReporters[url] = availableReporter(
        [`[OK] Datasource ${url} available`, WebhookType.RECOVERY],
        [`[FAILURE] Datasource ${url} unavailable`, WebhookType.FAILURE],
        this.sendMsg,
        this.sendMsg
      );
    }
    return this._datasourceAvailableReporters[url];
  }
}
