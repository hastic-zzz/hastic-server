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

  if(process.env.ALERT_ENDPOINT !== undefined) {
    fetch(process.env.ALERT_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(notification)
    })
      .then(data => console.log(data))
      .catch(err => console.error(`Can't send alert to ${process.env.ALERT_ENDPOINT}. Error: ${err}`));
  } else {
    console.error(`Can't send alert, env ALERT_ENDPOINT is undefined`);
  }
}

export { sendNotification }
