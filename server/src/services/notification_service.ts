import * as AnalyticUnit from '../models/analytic_units';
import * as config from '../config';

import axios from 'axios';
import * as _ from 'lodash';


export enum WebhookType {
  DETECT = 'DETECT',
  FAILURE = 'FAILURE',
  RECOVERY = 'RECOVERY',
  MESSAGE = 'MESSAGE'
}

export type MetaInfo = {
  type: WebhookType,
  from: number,
  to: number,
  params?: any
}

export type AnalyticMeta = {
  type: WebhookType,
  analyticUnitType: string,
  analyticUnitName: string,
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  grafanaUrl: string,
  from: number,
  to: number
  message?: any
}

export declare type Notification = {
  text: string,
  meta: MetaInfo | AnalyticMeta,
  image?: any
}

// TODO: split notifiers into 3 files
export interface Notifier {
  sendNotification(notification: Notification): Promise<void>;
}

// TODO: singleton
export function getNotifier(): Notifier {
  if(config.HASTIC_ALERT_TYPE === config.AlertTypes.WEBHOOK) {
    return new WebhookNotifier();
  }

  if(config.HASTIC_ALERT_TYPE === config.AlertTypes.ALERTMANAGER) {
    return new AlertManagerNotifier();
  }

  throw new Error(`${config.HASTIC_ALERT_TYPE} alert type not supported`);
}

class WebhookNotifier implements Notifier {
  async sendNotification(notification: Notification) {
    if(config.HASTIC_WEBHOOK_URL === null) {
      console.log(`HASTIC_WEBHOOK_URL is not set, skip sending notification: ${notification.text}`);
      return;
    }
  
    notification.text += `\nInstance: ${config.HASTIC_INSTANCE_NAME}`;
    const data = JSON.stringify(notification);

    const options = {
      method: 'POST',
      url: config.HASTIC_WEBHOOK_URL,
      data,
      headers: { 'Content-Type': 'application/json' }
    };

    await axios(options);
  }
}

type PostableAlertLabels = {
  alertname: string;
  [key: string]: string
};

type PostableAlertAnnotations = {
  message?: string;
  summary?: string;
};

type PostableAlert = {
  labels: PostableAlertLabels,
  annotations: PostableAlertAnnotations
  generatorURL?: string,
  endsAt?: string
};

class AlertManagerNotifier implements Notifier {

  /**
   * @throws {Error} from axios if query fails
   */
  async sendNotification(notification: Notification) {
    if(config.HASTIC_ALERTMANAGER_URL === null) {
      console.log(`HASTIC_ALERTMANAGER_URL is not set, skip sending notification: ${notification.text}`);
      return;
    }

    let generatorURL: string;
    let labels: PostableAlertLabels = {
      alertname:  notification.meta.type,
      instance: config.HASTIC_INSTANCE_NAME
    };
    let annotations: PostableAlertAnnotations = {
      message: notification.text
    };

    if(_.has(notification.meta, 'grafanaUrl')) {
      generatorURL = (notification.meta as AnalyticMeta).grafanaUrl;
      labels.alertname = (notification.meta as AnalyticMeta).analyticUnitName;
      labels.analyticUnitId = (notification.meta as AnalyticMeta).analyticUnitId;
      labels.analyticUnitType = (notification.meta as AnalyticMeta).analyticUnitType;
      annotations.message = `${(notification.meta as AnalyticMeta).message}\nURL: ${generatorURL}`;
    }

    annotations.message += `\nInstance: ${config.HASTIC_INSTANCE_NAME}`;
    
    let alertData: PostableAlert = {
      labels,
      annotations,
      generatorURL
    };

    let options = {
      method: 'POST',
      url: `${config.HASTIC_ALERTMANAGER_URL}/api/v2/alerts`,
      data: JSON.stringify([alertData]),
      headers: { 'Content-Type': 'application/json' }
    };
  
    // first part: send "start" request
    await axios(options);
    // TODO: resolve FAILURE alert only after RECOVERY event
    // second part: send "end" request
    options.data = JSON.stringify([alertData]);
    await axios(options);
  }
}
