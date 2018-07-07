import * as path from 'path'
import { getJsonDataSync, writeJsonDataSync } from './json'
import { ANOMALIES_PATH } from '../config'
import * as fs from 'fs'
import * as crypto from 'crypto';

export type Datasource = {
  method: string,
  data: Object,
  params: Object,
  type: string,
  url: string
}

export type Metric = {
  datasource: string,
  targets: string[]
}

export type AnalyticUnit = {
  name: string,

  panelUrl: string,

  pattern: string,
  metric: Metric,
  datasource: Datasource
  status: string,
  error?: string,

  lastPredictionTime: number,
  nextId: number
}

export type AnomalyUnitKey = string;

let anomaliesNameToIdMap = {};


function insertAnomaly(item: AnalyticUnit): AnomalyUnitKey {
  const hashString = item.name + (new Date()).toString();
  const predictorId: AnomalyUnitKey = crypto.createHash('md5').update(hashString).digest('hex');
  anomaliesNameToIdMap[item.name] = predictorId;
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  if(fs.existsSync(filename)) {
    return null;
  }
  saveAnomaly(predictorId, item);
  return predictorId;
}

function removeItem(predictorId: AnomalyUnitKey) {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  fs.unlinkSync(filename);
}

function saveAnomaly(predictorId: AnomalyUnitKey, anomaly: AnalyticUnit) {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  return writeJsonDataSync(filename, anomaly);
}

function loadPredictorById(predictorId: AnomalyUnitKey): AnalyticUnit {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  if(!fs.existsSync(filename)) {
    return null;
  }
  return getJsonDataSync(filename);
}

function saveAnomalyTypeInfo(info) {
  console.log('Saving');
  let filename = path.join(ANOMALIES_PATH, `${info.name}.json`);
  if(info.next_id === undefined) {
    info.next_id = 0;
  }
  if(info.last_prediction_time === undefined) {
      info.last_prediction_time = 0;
  }

  return writeJsonDataSync(filename, info);
}

function getAnomalyTypeInfo(name) {
  return getJsonDataSync(path.join(ANOMALIES_PATH, `${name}.json`));
}

function setAnomalyStatus(predictorId: AnomalyUnitKey, status: string, error?: string) {
  let info = loadPredictorById(predictorId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  saveAnomaly(predictorId, info);
}

function setAnomalyPredictionTime(predictorId: AnomalyUnitKey, lastPredictionTime: number) {
  let info = loadPredictorById(predictorId);
  info.lastPredictionTime = lastPredictionTime;
  saveAnomaly(predictorId, info);
}

export {
  saveAnomaly, loadPredictorById, insertAnomaly, removeItem, saveAnomalyTypeInfo,
  getAnomalyTypeInfo, setAnomalyStatus, setAnomalyPredictionTime
}
