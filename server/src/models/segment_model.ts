import * as AnalyticUnit from './analytic_unit_model';


import * as _ from 'lodash';

import * as path from 'path';
import * as fs from 'fs';


export function getLabeledSegments(id: AnalyticUnit.AnalyticUnitId) {
  let filename = path.join(SEGMENTS_PATH, `${id}_labeled.json`);

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

export function getPredictedSegments(id: AnalyticUnit.AnalyticUnitId) {
  let filename = path.join(SEGMENTS_PATH, `${id}_segments.json`);

  let jsonData;
  try {
    jsonData = getJsonDataSync(filename);
  } catch(e) {
    console.error(e.message);
    jsonData = [];
  }
  return jsonData;
}

export function saveSegments(id: AnalyticUnit.AnalyticUnitId, segments) {
  let filename = path.join(SEGMENTS_PATH, `${id}_labeled.json`);

  try {
    return writeJsonDataSync(filename, _.uniqBy(segments, 'start'));
  } catch(e) {
    console.error(e.message);
    throw new Error('Can`t write to db');
  }
}

export async function insertSegments(id: AnalyticUnit.AnalyticUnitId, addedSegments, labeled: boolean) {
  // Set status
  let info = await AnalyticUnit.findById(id);
  let segments = getLabeledSegments(id);

  let nextId = info.nextId;
  let addedIds = []
  for (let segment of addedSegments) {
    segment.id = nextId;
    segment.labeled = labeled;
    addedIds.push(nextId);
    nextId++;
    segments.push(segment);
  }
  info.nextId = nextId;
  saveSegments(id, segments);
  await AnalyticUnit.update(id, info);
  return addedIds;
}

export function removeSegments(id: AnalyticUnit.AnalyticUnitId, removedSegments) {
  let segments = getLabeledSegments(id);
  for (let segmentId of removedSegments) {
    segments = segments.filter(el => el.id !== segmentId);
  }
  saveSegments(id, segments);
}
