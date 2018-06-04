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

export type AnomalyId = string;

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

function getAnomalyIdByName(anomalyName:string) : AnomalyId {
  loadAnomaliesMap();
  anomalyName = anomalyName.toLowerCase();
  if(anomalyName in anomaliesNameToIdMap) {
    return anomaliesNameToIdMap[anomalyName];
  }
  return anomalyName;
}

function insertAnomaly(anomaly: Anomaly) : AnomalyId {
  const hashString = anomaly.name + (new Date()).toString();
  const anomalyId:AnomalyId = crypto.createHash('md5').update(hashString).digest('hex');
  anomaliesNameToIdMap[anomaly.name] = anomalyId;
  saveAnomaliesMap();
  // return anomalyId
  // const anomalyId:AnomalyId = anomaly.name;
  let filename = path.join(ANOMALIES_PATH, `${anomalyId}.json`);
  if(fs.existsSync(filename)) {
    return null;
  }
  saveAnomaly(anomalyId, anomaly);
  return anomalyId;
}

function removeAnomaly(anomalyId:AnomalyId) {
  let filename = path.join(ANOMALIES_PATH, `${anomalyId}.json`);
  fs.unlinkSync(filename);
}

function saveAnomaly(anomalyId: AnomalyId, anomaly: Anomaly) {
  let filename = path.join(ANOMALIES_PATH, `${anomalyId}.json`);
  return writeJsonDataSync(filename, anomaly);
}

function loadAnomalyById(anomalyId: AnomalyId) : Anomaly {
  let filename = path.join(ANOMALIES_PATH, `${anomalyId}.json`);
  if(!fs.existsSync(filename)) {
    return null;
  }
  return getJsonDataSync(filename);
}

function loadAnomalyByName(anomalyName: string) : Anomaly {
  let anomalyId = getAnomalyIdByName(anomalyName);
  return loadAnomalyById(anomalyId);
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

function setAnomalyStatus(anomalyId:AnomalyId, status:string, error?:string) {
  let info = loadAnomalyById(anomalyId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  saveAnomaly(anomalyId, info);
}

function setAnomalyPredictionTime(anomalyId:AnomalyId, lastPredictionTime:number) {
  let info = loadAnomalyById(anomalyId);
  info.last_prediction_time = lastPredictionTime;
  saveAnomaly(anomalyId, info);
}

export {
  saveAnomaly, loadAnomalyById, loadAnomalyByName, insertAnomaly, removeAnomaly, saveAnomalyTypeInfo,
  getAnomalyTypeInfo, getAnomalyIdByName, setAnomalyStatus, setAnomalyPredictionTime
}
