import { sendWebhook } from './notification_service';

import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { Segment } from '../models/segment_model';


export class Alert {
  constructor(protected analyticUnit: AnalyticUnit.AnalyticUnit, protected sender) {};
  public recieve(segment: Segment) {
    this.sender(this.analyticUnit, segment);
  };
  public update(now: number) {};
}

class PatternAlert extends Alert {

  private lastSendedSegment: Segment;

  public recieve(segment: Segment) {
    if(this.lastSendedSegment === undefined || !segment.equals(this.lastSendedSegment) ) {
      this.lastSendedSegment = segment;
      this.sender(this.analyticUnit, segment);
    }
  }
};


class ThresholdAlert extends Alert {
  EXPIRE_PERIOD_MS = 60000;
  lastOccurence = 0;

  public recieve(segment: Segment) {
    if(this.lastOccurence === 0) {
      this.lastOccurence = segment.from;
      this.sender(this.analyticUnit, segment);
    } else {

      if(segment.from - this.lastOccurence > this.EXPIRE_PERIOD_MS) {
        console.debug(`time between threshold occurences ${segment.from - this.lastOccurence}ms, send alert`);
        this.sender(this.analyticUnit, segment);
      }

      this.lastOccurence = segment.from;
    }
  }

  public update(now: number) {}
}


export class AlertService {

  private _alerts: { [id: string]: Alert; };
  private _alertingEnable: boolean;
  private _sender: any;

  constructor() {
    this._alerts = {}
    this._alertingEnable = false;
    this._sender = (analyticUnit: AnalyticUnit.AnalyticUnit, segment: Segment) => {
      if(this._alertingEnable) {
        sendWebhook(analyticUnit.name, segment);
      }
    }
  }

  public recieveAlert(analyticUnit: AnalyticUnit.AnalyticUnit, segment: Segment) {
    let id = analyticUnit.id;

    if(!_.has(this._alerts, id)) {
      this.addAnalyticUnit(analyticUnit);
    }

    this._alerts[id].recieve(segment);
  };

  public addAnalyticUnit(analyticUnit: AnalyticUnit.AnalyticUnit) {
    let detector = AnalyticUnit.getDetectorByType(analyticUnit.type);
    let alertsType = {};

    alertsType[AnalyticUnit.DetectorType.THRESHOLD] = ThresholdAlert;
    alertsType[AnalyticUnit.DetectorType.PATTERN] = PatternAlert;

    this._alerts[analyticUnit.id] = new alertsType[detector](analyticUnit, this._sender);
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
