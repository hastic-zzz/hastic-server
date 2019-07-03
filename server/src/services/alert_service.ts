import { sendNotification, InfoMeta, AnalyticMeta, WebhookType, Notification } from './notification_service';
import axios from 'axios';
import * as _ from 'lodash';
import * as AnalyticUnit from '../models/analytic_units';
import { Segment } from '../models/segment_model';
import { availableReporter } from '../utils/reporter';
import { ORG_ID, HASTIC_API_KEY } from '../config';


export class Alert {
  public enabled = true;
  constructor(protected analyticUnit: AnalyticUnit.AnalyticUnit) {};
  public receive(segment: Segment) {
    if(this.enabled) {
      this.send(segment);
    }
  };

  protected async send(segment) {
    const notification = await this.makeNotification(segment);
    sendNotification(notification);
  }

  protected async makeNotification(segment: Segment): Promise<Notification> {
    const meta = this.makeMeta(segment);
    const message = this.makeMessage(meta);
    let result: Notification = { meta, message };
    const HASTIC_WEBHOOK_IMAGE_ENABLED = true;
    if(HASTIC_WEBHOOK_IMAGE_ENABLED) {
      try {
       const image = await this.loadImage();
       result.image = image;
      } catch(err) {
         console.error(`Can't load alert image: ${err}. Check that API key has admin permissions`);
      }
    }

    return result;
  }

  protected async loadImage() {
    const headers = { Authorization: `Bearer ${HASTIC_API_KEY}` };
    const dashdoardId = this.analyticUnit.panelId.split('/')[0];
    const panelId = this.analyticUnit.panelId.split('/')[1];
    const dashboardApiURL = `${this.analyticUnit.grafanaUrl}/api/dashboards/uid/${dashdoardId}`;
    const dashboardInfo: any = await axios.get(dashboardApiURL, { headers });
    const dashboardName = _.last(dashboardInfo.data.meta.url.split('/'));
    const renderUrl = `${this.analyticUnit.grafanaUrl}/render/d-solo/${dashdoardId}/${dashboardName}?panelId=${panelId}&ordId=${ORG_ID}&api-rendering`;
    const response = await axios.get(renderUrl, {
      headers,
      responseType: 'arraybuffer'
    });
    return new Buffer(response.data, 'binary').toString('base64');
  }

  protected makeMeta(segment: Segment): AnalyticMeta {
    const dashdoardId = this.analyticUnit.panelId.split('/')[0];
    const panelId = this.analyticUnit.panelId.split('/')[1];
    const grafanaUrl = `${this.analyticUnit.grafanaUrl}/d/${dashdoardId}?panelId=${panelId}&edit=true&fullscreen=true?orgId=${ORG_ID}`;

    let alert: AnalyticMeta = {
      type: WebhookType.DETECT,
      analyticUnitType: this.analyticUnit.type,
      analyticUnitName: this.analyticUnit.name,
      analyticUnitId: this.analyticUnit.id,
      grafanaUrl,
      from: segment.from,
      to: segment.to,
      message: segment.message
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
    `ID: ${meta.analyticUnitId}`,
    `Message: ${meta.message}`
    ].join('\n');
  }
}

class PatternAlert extends Alert {

  private lastSentSegment: Segment;

  public receive(segment: Segment) {
    if(this.lastSentSegment === undefined || !segment.equals(this.lastSentSegment) ) {
      this.lastSentSegment = segment;
      if(this.enabled) {
        this.send(segment);
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
  // TODO: make events for start and end of threshold
  EXPIRE_PERIOD_MS = 60000;
  lastOccurence = 0;

  public receive(segment: Segment) {
    if(this.lastOccurence === 0) {
      this.lastOccurence = segment.from;
      if(this.enabled) {
        this.send(segment);
      }
    } else {

      if(segment.from - this.lastOccurence > this.EXPIRE_PERIOD_MS) {
        if(this.enabled) {
          console.log(`time between threshold occurences ${segment.from - this.lastOccurence}ms, send alert`);
          this.send(segment);
        }
      }

      this.lastOccurence = segment.from;
    }
  }

  protected makeMessage(meta: AnalyticMeta): string {
    let message = [
      `[THRESHOLD ALERTING] ${meta.analyticUnitName}`,
      `URL: ${meta.grafanaUrl}`,
      ``,
      `Starts at: ${new Date(meta.from)}`,
      `ID: ${meta.analyticUnitId}`
    ].join('\n');

    if(meta.message !== undefined) {
      message += meta.message;
    }
    return message;
  }
}


export class AlertService {

  // TODO: object -> Map
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
