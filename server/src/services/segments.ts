import * as path from 'path';
import * as fs from 'fs';
import { getJsonDataSync, writeJsonDataSync }  from './json';
import { SEGMENTS_PATH } from '../config';
import { AnomalyId, loadAnomalyById, saveAnomaly } from './anomalyType';

import * as _ from 'lodash';

function getLabeledSegments(anomalyId: AnomalyId) {
  let filename = path.join(SEGMENTS_PATH, `${anomalyId}_labeled.json`);

  if(!fs.existsSync(filename)) {
    return [];
  } else {
    let segments = getJsonDataSync(filename);
    for(let segment of segments) {
      if(segment.labeled === undefined) {
        segment.labeled = false;
      }
    }
    return segments;
  }
}

function getPredictedSegments(anomalyId: AnomalyId) {
  let filename = path.join(SEGMENTS_PATH, `${anomalyId}_segments.json`);

  let jsonData;
  try {
    jsonData = getJsonDataSync(filename);
  } catch(e) {
    console.error(e.message);
    jsonData = [];
  }
  return jsonData;
}

function saveSegments(anomalyId: AnomalyId, segments) {
  let filename = path.join(SEGMENTS_PATH, `${anomalyId}_labeled.json`);

  try {
    return writeJsonDataSync(filename, _.uniqBy(segments, 'start'));
  } catch(e) {
    console.error(e.message);
    throw new Error('Can`t write to db');
  }
}

function insertSegments(anomalyId: AnomalyId, addedSegments, labeled:boolean) {
  // Set status
  let info = loadAnomalyById(anomalyId);
  let segments = getLabeledSegments(anomalyId);

  let nextId = info.next_id;
  let addedIds = []
  for (let segment of addedSegments) {
    segment.id = nextId;
    segment.labeled = labeled;
    addedIds.push(nextId);
    nextId++;
    segments.push(segment);
  }
  info.next_id = nextId;
  saveSegments(anomalyId, segments);
  saveAnomaly(anomalyId, info);
  return addedIds;
}

function removeSegments(anomalyId: AnomalyId, removedSegments) {
  let segments = getLabeledSegments(anomalyId);
  for (let segmentId of removedSegments) {
    segments = segments.filter(el => el.id !== segmentId);
  }
  saveSegments(anomalyId, segments);
}

export { getLabeledSegments, getPredictedSegments, saveSegments, insertSegments, removeSegments }
