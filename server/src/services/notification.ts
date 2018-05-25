import fetch from 'node-fetch';
import { loadAnomalyById } from './anomalyType';

function sendNotification(anomalyId, active) {
  let anomalyName = loadAnomalyById(anomalyId).name;
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
  if(endpoint !== undefined) {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(notification)
    })
      .then(data => console.log(data))
      .catch(err => console.error(`Can't send alert to ${endpoint}. Error: ${err}`));
  } else {
    console.error(`Can't send alert, env HASTIC_ALERT_ENDPOINT is undefined`);
  }
}

export { sendNotification }
