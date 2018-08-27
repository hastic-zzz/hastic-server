import { findById, AnalyticUnitId } from '../models/analytic_unit_model';

import axios from 'axios';


// TODO: send notification with payload without dep to AnalyticUnit
export async function sendNotification(id: AnalyticUnitId, active: boolean) {
  let anomalyName = (await findById(id)).name
  console.log('Notification ' + anomalyName);

  let notification = {
    anomaly: anomalyName,
    status: ''
  };
  if(active) {
    notification.status = 'alert';
  } else {
    notification.status = 'OK';
  }

  // TODO: more to config
  let endpoint = process.env.HASTIC_ALERT_ENDPOINT;
  if(endpoint === undefined) {
    console.error(`Can't send alert, env HASTIC_ALERT_ENDPOINT is undefined`);
    return;
  }

  try {
    var data = await axios.post(endpoint, {
      method: 'POST',
      body: JSON.stringify(notification)
    })
    console.log(data);
  } catch(err) {
    console.error(`Can't send alert to ${endpoint}. Error: ${err}`);
  }
  
}

