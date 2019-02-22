import { Segment } from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { HASTIC_WEBHOOK_URL, HASTIC_WEBHOOK_TYPE, HASTIC_WEBHOOK_SECRET } from '../config';

import axios from 'axios';
import * as querystring from 'querystring';

enum ContentType {
  JSON = 'application/json',
  URLENCODED ='application/x-www-form-urlencoded'
}

export enum WebhookType {
  DETECT = 'DETECT',
  FAILURE = 'FAILURE',
  RECOVERY = 'RECOVERY'
}

export declare type AnalyticAlert = {
  type: WebhookType,
  analyticUnitType: string,
  analyticUnitName: string,
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  panelUrl: string,
  from: number,
  to: number
  value?: number,
  segmentFeatures?: any,
  regionImage?: any
}

export declare type InfoAlert = {
  type: WebhookType,
  message: string,
  from: number,
  to: number,
  params?: any
}

// TODO: send webhook with payload without dep to AnalyticUnit
export async function sendAnalyticWebhook(analyticUnit: AnalyticUnit.AnalyticUnit, segment: Segment) {
  const alert: AnalyticAlert = {
    type: WebhookType.DETECT,
    analyticUnitType: analyticUnit.type,
    analyticUnitName: analyticUnit.name,
    analyticUnitId: analyticUnit.id,
    panelUrl: analyticUnit.panelUrl,
    from: segment.from,
    to: segment.to 
  };

  const fromTime = new Date(alert.from).toLocaleTimeString();
  const toTime = new Date(alert.to).toLocaleTimeString();
  console.log(`Sending alert unit:${alert.analyticUnitName} from: ${fromTime} to: ${toTime}`);

  let payload;
  if(HASTIC_WEBHOOK_TYPE === ContentType.JSON) {
    payload = JSON.stringify(alert);
  } else if(HASTIC_WEBHOOK_TYPE === ContentType.URLENCODED) {
    payload = querystring.stringify(alert);
  } else {
    throw new Error(`Unknown webhook type: ${HASTIC_WEBHOOK_TYPE}`);
  }
  sendWebhook(payload);
}

export async function sendInfoWebhook(message: InfoAlert) {
  if(message && typeof message === 'object') {
    console.log(`Sending info webhook ${JSON.stringify(message.message)}`);
    sendWebhook(message, ContentType.JSON);
  } else {
    console.error(`skip sending Info webhook, got corrupted message ${message}`);
  }
}

export async function sendWebhook(payload: any, contentType = HASTIC_WEBHOOK_TYPE) {
  if(HASTIC_WEBHOOK_URL === null) {
    throw new Error(`Can't send alert, HASTIC_WEBHOOK_URL is undefined`);
  }

  // TODO: use HASTIC_WEBHOOK_SECRET
  const options = {
    method: 'POST',
    url: HASTIC_WEBHOOK_URL,
    data: payload,
    headers: { 'Content-Type': contentType }
  };

  try {
    await axios(options);
  } catch(err) {
    console.error(`Can't send alert to ${HASTIC_WEBHOOK_URL}. Error: ${err.message}`);
  }
}
