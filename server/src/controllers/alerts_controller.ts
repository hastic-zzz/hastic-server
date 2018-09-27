import { runPredict } from './analytics_controller';
import * as Segment from '../models/segment_model';
import { AnalyticUnitId } from '../models/analytic_unit_model';
import { sendNotification } from '../services/notification_service';
import { getJsonDataSync, writeJsonDataSync } from '../services/json_service';
import { DATA_PATH } from '../config';

import * as path from 'path';
import * as fs from 'fs';


const ALERT_TIMEOUT = 60000; // ms
const ALERTS_DB_PATH = path.join(DATA_PATH, `alerts_anomalies.json`);


export function getAlertsAnomalies(): AnalyticUnitId[] {
  if(!fs.existsSync(ALERTS_DB_PATH)) {
    saveAlertsAnomalies([]);
  }
  return getJsonDataSync(ALERTS_DB_PATH);
}

export function saveAlertsAnomalies(units: AnalyticUnitId[]) {
  return writeJsonDataSync(ALERTS_DB_PATH, units);
}

async function processAlerts(id: AnalyticUnitId) {
  let segments = await Segment.findMany(id, { labeled: true });

  const currentTime = new Date().getTime();
  const activeAlert = activeAlerts.has(id);
  let newActiveAlert = false;

  if(segments.length > 0) {
    let lastSegment = segments[segments.length - 1];
    if(lastSegment.to >= currentTime - ALERT_TIMEOUT) {
      newActiveAlert = true;
    }
  }

  if(!activeAlert && newActiveAlert) {
    activeAlerts.add(id);
    sendNotification(id, true);
  } else if(activeAlert && !newActiveAlert) {
    activeAlerts.delete(id);
    sendNotification(id, false);
  }
}

async function alertsTick() {
  let alertsAnomalies = getAlertsAnomalies();
  console.log(alertsAnomalies);
  for (let predictorId of alertsAnomalies) {
    try {
      await runPredict(predictorId);
      await processAlerts(predictorId);
    } catch (e) {
      console.error(e);
    }
  }
  setTimeout(alertsTick, 5000);
}


const activeAlerts = new Set<string>();
setTimeout(alertsTick, 5000);
