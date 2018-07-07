import { getJsonDataSync, writeJsonDataSync } from '../services/json'
import { ANOMALIES_PATH } from '../config'

import * as crypto from 'crypto';

import * as path from 'path'
import * as fs from 'fs'


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

export type AnalyticUnitId = string;


function createItem(item: AnalyticUnit): AnalyticUnitId {
  const hashString = item.name + (new Date()).toString();
  const newId: AnalyticUnitId = crypto.createHash('md5').update(hashString).digest('hex');
  let filename = path.join(ANOMALIES_PATH, `${newId}.json`);
  if(fs.existsSync(filename)) {
    return null;
  }
  save(newId, item);
  return newId;
}

function removeItem(key: AnalyticUnitId) {
  let filename = path.join(ANOMALIES_PATH, `${key}.json`);
  fs.unlinkSync(filename);
}

function save(predictorId: AnalyticUnitId, anomaly: AnalyticUnit) {
  let filename = path.join(ANOMALIES_PATH, `${predictorId}.json`);
  return writeJsonDataSync(filename, anomaly);
}

function loadById(predictorId: AnalyticUnitId): AnalyticUnit {
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

function setAnomalyStatus(predictorId: AnalyticUnitId, status: string, error?: string) {
  let info = loadById(predictorId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  save(predictorId, info);
}

function setAnomalyPredictionTime(predictorId: AnalyticUnitId, lastPredictionTime: number) {
  let info = loadById(predictorId);
  info.lastPredictionTime = lastPredictionTime;
  save(predictorId, info);
}

export {
  save, loadById, createItem, removeItem, saveAnomalyTypeInfo,
  getAnomalyTypeInfo, setAnomalyStatus, setAnomalyPredictionTime
}
