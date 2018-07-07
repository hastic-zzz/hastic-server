import { getJsonDataSync, writeJsonDataSync } from '../services/json_service';
import { AnalyticUnitId } from '../models/analytic_unit';
import { runPredict } from './analytics_controller';
import { sendNotification } from '../services/notification_service';
import { getLabeledSegments } from './segments_controller';

import { ANALYTIC_UNITS_PATH } from '../config';

import * as path from 'path';
import * as fs from 'fs';


const ALERT_TIMEOUT = 60000; // ms
const ALERTS_DB_PATH = path.join(ANALYTIC_UNITS_PATH, `alerts_anomalies.json`);


export function getAlertsAnomalies(): AnalyticUnitId[] {
  if(!fs.existsSync(ALERTS_DB_PATH)) {
    saveAlertsAnomalies([]);
  }
  return getJsonDataSync(ALERTS_DB_PATH);
}

export function saveAlertsAnomalies(units: AnalyticUnitId[]) {
  return writeJsonDataSync(ALERTS_DB_PATH, units);
}

function processAlerts(id: AnalyticUnitId) {
  let segments = getLabeledSegments(id);

  const currentTime = new Date().getTime();
  const activeAlert = activeAlerts.has(id);
  let newActiveAlert = false;

  if(segments.length > 0) {
    let lastSegment = segments[segments.length - 1];
    if(lastSegment.finish >= currentTime - ALERT_TIMEOUT) {
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
  for (let predictorId of alertsAnomalies) {
    try {
      await runPredict(predictorId);
      processAlerts(predictorId);
    } catch (e) {
      console.error(e);
    }
  }
  setTimeout(alertsTick, 5000);
}


const activeAlerts = new Set<string>();
setTimeout(alertsTick, 5000);
