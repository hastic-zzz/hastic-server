import * as AnalyticUnit from '../models/analytic_units';
import { HASTIC_WEBHOOK_URL, HASTIC_WEBHOOK_TYPE, HASTIC_WEBHOOK_SECRET, HASTIC_INSTANCE_NAME } from '../config';

import axios from 'axios';
import * as querystring from 'querystring';
import * as _ from 'lodash';

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

export declare type AnalyticMeta = {
  type: WebhookType,
  analyticUnitType: string,
  analyticUnitName: string,
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  grafanaUrl: string,
  from: number,
  to: number
  message?: any
}

export declare type InfoMeta = {
  type: WebhookType,
  from: number,
  to: number,
  params?: any
}

export declare type Notification = {
  message: string,
  meta: InfoMeta | AnalyticMeta,
  image?: any
}

export async function sendNotification(notification: Notification) {
  if(HASTIC_WEBHOOK_URL === null) {
    throw new Error(`Can't send notification, HASTIC_WEBHOOK_URL is undefined`);
  }

  notification.message += `\nInstance: ${HASTIC_INSTANCE_NAME}`;

  let data;
  if(HASTIC_WEBHOOK_TYPE === ContentType.JSON) {
    data = JSON.stringify(notification);
  } else if(HASTIC_WEBHOOK_TYPE === ContentType.URLENCODED) {
    data = querystring.stringify(notification);
  } else {
    throw new Error(`Unknown webhook type: ${HASTIC_WEBHOOK_TYPE}`);
  }

  // TODO: use HASTIC_WEBHOOK_SECRET
  const options = {
    method: 'POST',
    url: HASTIC_WEBHOOK_URL,
    data,
    headers: { 'Content-Type': HASTIC_WEBHOOK_TYPE }
  };

  try {
    await axios(options);
  } catch(err) {
    console.error(`Can't send notification to ${HASTIC_WEBHOOK_URL}. Error: ${err.message}`);
  }
}
