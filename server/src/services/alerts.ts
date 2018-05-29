import { getJsonDataSync, writeJsonDataSync } from './json';
import { AnomalyId } from './anomalyType';
import { runPredict } from './analytics';
import { sendNotification } from './notification';
import { getLabeledSegments } from './segments';

import { ANOMALIES_PATH } from '../config';

import * as path from 'path';
import * as fs from 'fs';


const ALERTS_DB_PATH = path.join(ANOMALIES_PATH, `alerts_anomalies.json`);

function getAlertsAnomalies(): AnomalyId[] {
  if(!fs.existsSync(ALERTS_DB_PATH)) {
    saveAlertsAnomalies([]);
  }
  return getJsonDataSync(ALERTS_DB_PATH);
}

function saveAlertsAnomalies(anomalies: AnomalyId[]) {
  return writeJsonDataSync(ALERTS_DB_PATH, anomalies);
}

function processAlerts(anomalyId) {
  let segments = getLabeledSegments(anomalyId);

  const currentTime = new Date().getTime();
  const activeAlert = activeAlerts.has(anomalyId);
  let newActiveAlert = false;

  if(segments.length > 0) {
    let lastSegment = segments[segments.length - 1];
    if(lastSegment.finish >= currentTime - alertTimeout) {
      newActiveAlert = true;
    }
  }

  if(!activeAlert && newActiveAlert) {
    activeAlerts.add(anomalyId);
    sendNotification(anomalyId, true);
  } else if(activeAlert && !newActiveAlert) {
    activeAlerts.delete(anomalyId);
    sendNotification(anomalyId, false);
  }
}

async function alertsTick() {
  let alertsAnomalies = getAlertsAnomalies();
  for (let anomalyId of alertsAnomalies) {
    try {
      await runPredict(anomalyId);
      processAlerts(anomalyId);
    } catch (e) {
      console.error(e);
    }
  }
  setTimeout(alertsTick, 5000);
}

const alertTimeout = 60000; // ms
const activeAlerts = new Set<string>();
setTimeout(alertsTick, 5000);


export { getAlertsAnomalies, saveAlertsAnomalies }
