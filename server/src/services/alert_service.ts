import { sendAnalyticWebhook, sendInfoWebhook, InfoAlert, AnalyticAlert, WebhookType } from './notification_service';

import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_units';
import { Segment } from '../models/segment_model';
import { availableReporter } from '../utils/reporter';


export class Alert {
  public enabled = true;
  constructor(protected analyticUnit: AnalyticUnit.AnalyticUnit) {};
  public receive(segment: Segment) {
    if(this.enabled) {
      const alert = this.makeAlert(segment);
      sendAnalyticWebhook(alert);
    }
  };

  protected makeAlert(segment): AnalyticAlert {
    const alert: AnalyticAlert = {
      type: WebhookType.DETECT,
      analyticUnitType: this.analyticUnit.type,
      analyticUnitName: this.analyticUnit.name,
      analyticUnitId: this.analyticUnit.id,
      grafanaUrl: this.analyticUnit.grafanaUrl,
      from: segment.from,
      to: segment.to 
    };

    return alert;
  }
}

class PatternAlert extends Alert {

  private lastSentSegment: Segment;

  public receive(segment: Segment) {
    if(this.lastSentSegment === undefined || !segment.equals(this.lastSentSegment) ) {
      this.lastSentSegment = segment;
      if(this.enabled) {
        sendAnalyticWebhook(this.makeAlert(segment));
      }
    }
  }
};


class ThresholdAlert extends Alert {
  // TODO: configure threshold timing in panel like Grafana's alerts (`evaluate` time, `for` time)
  EXPIRE_PERIOD_MS = 60000;
  lastOccurence = 0;

  public receive(segment: Segment) {
    if(this.lastOccurence === 0) {
      this.lastOccurence = segment.from;
      if(this.enabled) {
        sendAnalyticWebhook(this.makeAlert(segment));
      }
    } else {

      if(segment.from - this.lastOccurence > this.EXPIRE_PERIOD_MS) {
        if(this.enabled) {
          console.log(`time between threshold occurences ${segment.from - this.lastOccurence}ms, send alert`);
          sendAnalyticWebhook(this.makeAlert(segment));
        }
      }

      this.lastOccurence = segment.from;
    }
  }
}


export class AlertService {

  private _alerts: { [id: string]: Alert };
  private _alertingEnable: boolean;
  private _grafanaAvailableReporter: Function;
  private _datasourceAvailableReporters: { [url: string]: Function };

  constructor() {
    this._alerts = {};
    this._datasourceAvailableReporters = {};

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
    const infoAlert: InfoAlert = {
      message,
      params: optionalInfo,
      type,
      from: now,
      to: now
    }
    sendInfoWebhook(infoAlert);
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
