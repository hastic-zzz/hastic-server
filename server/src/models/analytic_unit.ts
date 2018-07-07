import { getJsonDataSync, writeJsonDataSync } from '../controllers/json'
import { ANALYTIC_UNITS_PATH } from '../config'

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

export type AnalyticUnitId = string;

export type AnalyticUnit = {
  id?: AnalyticUnitId,
  name: string,
  panelUrl: string,
  type: string,
  metric: Metric,
  datasource: Datasource
  status: string,
  error?: string,
  lastPredictionTime: number,
  nextId: number
}

export function createItem(item: AnalyticUnit): AnalyticUnitId {
  const hashString = item.name + (new Date()).toString();
  const newId: AnalyticUnitId = crypto.createHash('md5').update(hashString).digest('hex');
  let filename = path.join(ANALYTIC_UNITS_PATH, `${newId}.json`);
  if(fs.existsSync(filename)) {
    throw new Error(`Can't create item with id ${newId}`);
  }
  save(newId, item);
  item.id = newId;
  return newId;
}

export function remove(id: AnalyticUnitId) {
  let filename = path.join(ANALYTIC_UNITS_PATH, `${id}.json`);
  fs.unlinkSync(filename);
}

export function save(id: AnalyticUnitId, unit: AnalyticUnit) {
  let filename = path.join(ANALYTIC_UNITS_PATH, `${id}.json`);
  return writeJsonDataSync(filename, unit);
}

// TODO: make async
export function findById(id: AnalyticUnitId): AnalyticUnit {
  let filename = path.join(ANALYTIC_UNITS_PATH, `${id}.json`);
  if(!fs.existsSync(filename)) {
    throw new Error(`Can't find Analytic Unit with id ${id}`);
  }
  return getJsonDataSync(filename);
}

export function setStatus(predictorId: AnalyticUnitId, status: string, error?: string) {
  let info = findById(predictorId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  save(predictorId, info);
}

export function setPredictionTime(id: AnalyticUnitId, time: number) {
  let info = findById(id);
  info.lastPredictionTime = time;
  save(id, info);
}
