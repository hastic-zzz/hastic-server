import axios from 'axios';
import { loadById } from '../models/analytic_unit';

export async function sendNotification(predictorId, active) {
  let anomalyName = loadById(predictorId).name;
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
    console.error(`Can't send alert to ${endpoint}. Error: ${err}`)
  }
  
}

