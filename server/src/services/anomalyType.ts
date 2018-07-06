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

export type Anomaly = {
  name: string,

  panelUrl: string,

  pattern: string,
  metric: Metric,
  datasource: Datasource
  status: string,
  error?: string,

  last_prediction_time: number,
  next_id: number
}

export type PredictorId = string;

let anomaliesNameToIdMap = {};

function loadAnomaliesMap() {
  let filename = path.join(ANOMALIES_PATH, `all_anomalies.json`);
  if(!fs.existsSync(filename)) {
    saveAnomaliesMap();
  }
  anomaliesNameToIdMap = getJsonDataSync(filename);
}

function saveAnomaliesMap() {
  let filename = path.join(ANOMALIES_PATH, `all_anomalies.json`);
  writeJsonDataSync(filename, anomaliesNameToIdMap);
}

function getPredictorIdByName(anomalyName:string) : PredictorId {
  loadAnomaliesMap();
  anomalyName = anomalyName.toLowerCase();
  if(anomalyName in anomaliesNameToIdMap) {
    return anomaliesNameToIdMap[anomalyName];
  }
  return anomalyName;
}

function insertAnomaly(anomaly: Anomaly) : PredictorId {
  const hashString = anomaly.name + (new Date()).toString();
  const predictorId:PredictorId = crypto.createHash('md5').update(hashString).digest('hex');
  anomaliesNameToIdMap[anomaly.name] = predictorId;
  saveAnomaliesMap();
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  if(fs.existsSync(filename)) {
    return null;
  }
  saveAnomaly(predictorId, anomaly);
  return predictorId;
}

function removeAnomaly(predictorId:PredictorId) {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  fs.unlinkSync(filename);
}

function saveAnomaly(predictorId: PredictorId, anomaly: Anomaly) {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  return writeJsonDataSync(filename, anomaly);
}

function loadAnomalyById(predictorId: PredictorId) : Anomaly {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  if(!fs.existsSync(filename)) {
    return null;
  }
  return getJsonDataSync(filename);
}

function loadAnomalyByName(anomalyName: string) : Anomaly {
  let predictorId = getPredictorIdByName(anomalyName);
  return loadAnomalyById(predictorId);
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

function setAnomalyStatus(predictorId:PredictorId, status:string, error?:string) {
  let info = loadAnomalyById(predictorId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  saveAnomaly(predictorId, info);
}

function setAnomalyPredictionTime(predictorId:PredictorId, lastPredictionTime:number) {
  let info = loadAnomalyById(predictorId);
  info.last_prediction_time = lastPredictionTime;
  saveAnomaly(predictorId, info);
}

export {
  saveAnomaly, loadAnomalyById, loadAnomalyByName, insertAnomaly, removeAnomaly, saveAnomalyTypeInfo,
  getAnomalyTypeInfo, getPredictorIdByName, setAnomalyStatus, setAnomalyPredictionTime
}
