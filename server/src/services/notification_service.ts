import { findById, AnalyticUnitId } from '../models/analytic_unit_model';
import { HASTIC_WEBHOOK_URL, HASTIC_WEBHOOK_TYPE, HASTIC_WEBHOOK_SECRET } from '../config';

import axios from 'axios';
import * as querystring from 'querystring';


// TODO: send notification with payload without dep to AnalyticUnit
export async function sendNotification(id: AnalyticUnitId, active: boolean) {
  if(HASTIC_WEBHOOK_URL === null) {
    throw new Error(`Can't send alert, HASTIC_WEBHOOK_URL is undefined`);
  }

  const analyticUnit = await findById(id);
  if(analyticUnit === null) {
    throw new Error(`Cannot send alert. There is no analytic unit with id "${id}"`);
  }
  const analyticUnitName = analyticUnit.name;
  let status;
  if(active) {
    status = 'alert';
  } else {
    status = 'OK';
  }
  const alert = {
    analyticUnit: analyticUnitName,
    status
  };

  console.log(`Sending alert: ${JSON.stringify(alert)}`);

  let payload;
  if(HASTIC_WEBHOOK_TYPE === 'application/json') {
    payload = JSON.stringify(alert);
  } else if(HASTIC_WEBHOOK_TYPE === 'application/x-www-form-urlencoded') {
    payload = querystring.stringify(alert);
  } else {
    throw new Error(`Unknown webhook type: ${HASTIC_WEBHOOK_TYPE}`);
  }

  // TODO: use HASTIC_WEBHOOK_SECRET
  const options = {
    method: 'POST',
    url: HASTIC_WEBHOOK_URL,
    data: payload,
    headers: { 'Content-Type': HASTIC_WEBHOOK_TYPE }
  };

  try {
    const response = await axios(options);
    console.log(response);
  } catch(err) {
    console.error(`Can't send alert to ${HASTIC_WEBHOOK_URL}. Error: ${err.message}`);
  }

}

