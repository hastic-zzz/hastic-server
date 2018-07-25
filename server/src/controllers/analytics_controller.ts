import { getTarget } from './metrics_controler';
import { getLabeledSegments, insertSegments, removeSegments } from './segments_controller'
import * as AnalyticUnit from '../models/analytic_unit'
import { AnalyticsService } from '../services/analytics_service'


const taskMap = {};
let nextTaskId = 0;

let analyticsService = undefined;

function onResponse(response: any) {
  let taskId = response._taskId;
  let status = response.status;
  if(status === 'success' || status === 'failed') {
    if(taskId in taskMap) {
      let resolver = taskMap[taskId];
      resolver(response);
      delete taskMap[taskId];
    }
  }
}

export function init() {
  analyticsService = new AnalyticsService(onResponse);
}

export function terminate() {
  analyticsService.close();
}

async function runTask(task): Promise<any> {
  let anomaly: AnalyticUnit.AnalyticUnit = AnalyticUnit.findById(task.analyticUnitId);
  task.metric = {
    datasource: anomaly.metric.datasource,
    targets: anomaly.metric.targets.map(getTarget)
  };

  task._taskId = nextTaskId++;
  await analyticsService.sendTask(task);

  return new Promise<void>(resolve => {
    taskMap[task._taskId] = resolve;
  })
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {
  let segments = getLabeledSegments(id);
  AnalyticUnit.setStatus(id, 'learning');
  let unit = AnalyticUnit.findById(id);
  let pattern = unit.type;
  let task = {
    analyticUnitId: id,
    type: 'learn',
    pattern,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'success') {
    AnalyticUnit.setStatus(id, 'ready');
    insertSegments(id, result.segments, false);
    AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  } else {
    AnalyticUnit.setStatus(id, 'failed', result.error);
  }
}


export async function runPredict(id: AnalyticUnit.AnalyticUnitId) {
  let unit = AnalyticUnit.findById(id);
  let pattern = unit.type;
  let task = {
    type: 'predict',
    analyticUnitId: id,
    pattern,
    lastPredictionTime: unit.lastPredictionTime
  };
  let result = await runTask(task);

  if(result.status === 'failed') {
    return [];
  }
  // Merging segments
  let segments = getLabeledSegments(id);
  if(segments.length > 0 && result.segments.length > 0) {
    let lastOldSegment = segments[segments.length - 1];
    let firstNewSegment = result.segments[0];

    if(firstNewSegment.start <= lastOldSegment.finish) {
      result.segments[0].start = lastOldSegment.start;
      removeSegments(id, [lastOldSegment.id]);
    }
  }

  insertSegments(id, result.segments, false);
  AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  return result.segments;
}

export function isAnalyticReady(): boolean {
  return analyticsService.ready;
}