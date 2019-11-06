import * as AnalyticUnit from '../models/analytic_units';
import * as config from '../config';

import axios from 'axios';
import * as querystring from 'querystring';
import * as _ from 'lodash';
import { analyticsLastAlive } from '../controllers/analytics_controller';

enum ContentType {
  JSON = 'application/json',
  URLENCODED ='application/x-www-form-urlencoded'
}

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

export interface Notifier {
  sendNotification(notification: Notification): Promise<void>;
}

export function getNotifier(): Notifier {
  if(config.HASTIC_ALERT_TYPE === config.AlertTypes.webhook) {
    return new WebhookNotifier();
  }

  if(config.HASTIC_ALERT_TYPE === config.AlertTypes.alertmanager) {
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
  
    let data;
    if(config.HASTIC_WEBHOOK_TYPE === ContentType.JSON) {
      data = JSON.stringify(notification);
    } else if(config.HASTIC_WEBHOOK_TYPE === ContentType.URLENCODED) {
      data = querystring.stringify(notification);
    } else {
      throw new Error(`Unknown webhook type: ${config.HASTIC_WEBHOOK_TYPE}`);
    }
  
    // TODO: use HASTIC_WEBHOOK_SECRET
    const options = {
      method: 'POST',
      url: config.HASTIC_WEBHOOK_URL,
      data,
      headers: { 'Content-Type': config.HASTIC_WEBHOOK_TYPE }
    };
  
    try {
      await axios(options);
    } catch(err) {
      console.error(`Can't send notification to ${config.HASTIC_WEBHOOK_URL}. Error: ${err.message}`);
    }
  }
}

type PostableAlertLabels = {
  alertname: string;
  [key: string]: string
};

type PostableAlertAnnotations = {
  info?: string;
  summary?: string;
};

type PostableAlert = {
  labels: PostableAlertLabels,
  annotations: PostableAlertAnnotations
  generatorURL?: string
};

class AlertManagerNotifier implements Notifier {
  async sendNotification(notification: Notification) {
    if(config.HASTIC_ALERTMANAGER_URL === null) {
      console.log(`HASTIC_ALERTMANAGER_URL is not set, skip sending notification: ${notification.text}`);
      return;
    }
  
    notification.text += `\nInstance: ${config.HASTIC_INSTANCE_NAME}`;

    let generatorURL: string;
    let labels: PostableAlertLabels = {
      alertname:  notification.meta.type,
      instance: config.HASTIC_INSTANCE_NAME
    };
    let annotations: PostableAlertAnnotations = {
      info: notification.text
    };

    if(_.has(notification.meta, 'grafanaUrl')) {
      generatorURL = (notification.meta as AnalyticMeta).grafanaUrl;
      labels.alertname = (notification.meta as AnalyticMeta).analyticUnitName;
      labels.analyticUnitId = (notification.meta as AnalyticMeta).analyticUnitId;
      labels.analyticUnitType = (notification.meta as AnalyticMeta).analyticUnitType;
    }
    
    let alertData: PostableAlert = {
      labels,
      annotations,
      generatorURL
    };

    let data = JSON.stringify([alertData]);

    const options = {
      method: 'POST',
      url: `${config.HASTIC_ALERTMANAGER_URL}/api/v2/alerts`,
      data,
      headers: { 'Content-Type': ContentType.JSON }
    };
  
    try {
      await axios(options);
    } catch(err) {
      console.error(`Can't send notification to ${config.HASTIC_ALERTMANAGER_URL}: Error ${err.response.data.code} ${err.response.data.message}`);
    }
  }
}
