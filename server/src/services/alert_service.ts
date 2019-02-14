import { sendAnalyticWebhook, sendInfoWebhook } from './notification_service';

import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { Segment } from '../models/segment_model';


export class Alert {
  public enabled = true;
  constructor(protected analyticUnit: AnalyticUnit.AnalyticUnit) {};
  public receive(segment: Segment) {
    if(this.enabled) {
      sendAnalyticWebhook(this.analyticUnit.name, segment);
    }
  };
}

class PatternAlert extends Alert {

  private lastSentSegment: Segment;

  public receive(segment: Segment) {
    if(this.lastSentSegment === undefined || !segment.equals(this.lastSentSegment) ) {
      this.lastSentSegment = segment;
      if(this.enabled) {
        sendAnalyticWebhook(this.analyticUnit.name, segment);
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
        sendAnalyticWebhook(this.analyticUnit.name, segment);
      }
    } else {

      if(segment.from - this.lastOccurence > this.EXPIRE_PERIOD_MS) {
        if(this.enabled) {
          console.log(`time between threshold occurences ${segment.from - this.lastOccurence}ms, send alert`);
          sendAnalyticWebhook(this.analyticUnit.name, segment);
        }
      }

      this.lastOccurence = segment.from;
    }
  }
}


export class AlertService {

  private _alerts: { [id: string]: Alert; };
  private _alertingEnable: boolean;

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

  public onStateChange(message: string, optionalInfo={}) {
    let message_payload = {
      message
    };
    sendInfoWebhook(Object.assign(message_payload, optionalInfo));
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
