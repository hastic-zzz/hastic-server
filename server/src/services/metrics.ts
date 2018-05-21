import * as path from 'path';
import { getJsonDataSync, writeJsonDataSync }  from './json';
import { METRICS_PATH } from '../config';
import * as crypto from 'crypto';

function saveTargets(targets) {
  let metrics = [];
  for (let target of targets) {
    metrics.push(saveTarget(target));
  }
  return metrics;
}

function saveTarget(target) {
  //const md5 = crypto.createHash('md5')
  const targetId = crypto.createHash('md5').update(JSON.stringify(target)).digest('hex');
  let filename = path.join(METRICS_PATH, `${targetId}.json`);
  writeJsonDataSync(filename, target);
  return targetId;
}

function getTarget(targetId) {
  let filename = path.join(METRICS_PATH, `${targetId}.json`);
  return getJsonDataSync(filename);
}

export { saveTargets, getTarget }
