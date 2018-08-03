import { loadFile, saveFile } from '../services/data_service';

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
  let filename = `${newId}.json`;
  if(fs.existsSync(filename)) {
    throw new Error(`Can't create item with id ${newId}`);
  }
  save(newId, item);
  item.id = newId;
  return newId;
}

export function remove(id: AnalyticUnitId) {
  let filename = `${id}.json`;
  fs.unlinkSync(filename);
}

export function save(id: AnalyticUnitId, unit: AnalyticUnit) {
  let filename = `${id}.json`;
  return saveFile(filename, JSON.stringify(unit));
}

// TODO: make async
export async function findById(id: AnalyticUnitId): Promise<AnalyticUnit> {
  let filename = `${id}.json`;
  if(!fs.existsSync(filename)) {
    throw new Error(`Can't find Analytic Unit with id ${id}`);
  }
  let result = await loadFile(filename);
  return JSON.parse(result);
}

export async function setStatus(predictorId: AnalyticUnitId, status: string, error?: string) {
  let info = await findById(predictorId);
  info.status = status;
  if(error !== undefined) {
    info.error = error;
  } else {
    info.error = '';
  }
  save(predictorId, info);
}

export async function setPredictionTime(id: AnalyticUnitId, time: number) {
  let info = await findById(id);
  info.lastPredictionTime = time;
  save(id, info);
}
