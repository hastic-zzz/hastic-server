import { sendAnalyticWebhook, sendInfoWebhook, InfoAlert, AnalyticAlert, WebhookType } from './notification_service';

import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_unit_model';
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
    if(segment.params) {
      alert.params = segment.params;
    }
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

  private _alerts: { [id: string]: Alert; };
  private _alertingEnable: boolean;
  private _grafanaAvailableReporter: Function;

  constructor() {
    this._alerts = {}
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

  public getGrafanaAvailableReporter() {
    if(!this._grafanaAvailableReporter) {
      this._grafanaAvailableReporter = availableReporter(
        ['Grafana available', WebhookType.RECOVERY],
        ['Grafana unavailable for pulling data', WebhookType.FAILURE],
        this.sendMsg,
        this.sendMsg
      );
    }
    return this._grafanaAvailableReporter;
  }

  public getAvailableWebhook(recoveryMsg: string, failureMsg: string) {
    return availableReporter(
      [recoveryMsg, WebhookType.RECOVERY],
      [failureMsg, WebhookType.FAILURE],
      this.sendMsg,
      this.sendMsg
    );
  }

  public addAnalyticUnit(analyticUnit: AnalyticUnit.AnalyticUnit) {
    let detector = AnalyticUnit.getDetectorByType(analyticUnit.type);
    let alertsType = {};

    alertsType[AnalyticUnit.DetectorType.THRESHOLD] = ThresholdAlert;
    alertsType[AnalyticUnit.DetectorType.PATTERN] = PatternAlert;

    this._alerts[analyticUnit.id] = new alertsType[detector](analyticUnit);
  }

  public removeAnalyticUnit(analyticUnitId: AnalyticUnit.AnalyticUnitId) {
    delete this._alerts[analyticUnitId];
  }

  public stopAlerting() {
    this._alertingEnable = false;
    this._alerts = {};
  }

  public startAlerting() {
    this._alertingEnable = true;
  }
}
