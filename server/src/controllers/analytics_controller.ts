import * as DataService from '../services/data_service';
import { getTarget } from './metrics_controler';
import { getLabeledSegments, insertSegments, removeSegments } from './segments_controller';
import * as AnalyticUnit from '../models/analytic_unit'
import { AnalyticsService, AnalyticsMessage } from '../services/analytics_service';


const taskMap = {};
let nextTaskId = 0;

let analyticsService = undefined;


function onTaskResult(taskResult: any) {
  let taskId = taskResult._taskId;
  let status = taskResult.status;
  if(status === 'SUCCESS' || status === 'FAILED') {
    if(taskId in taskMap) {
      let resolver = taskMap[taskId];
      resolver(taskResult);
      delete taskMap[taskId];
    }
  }
}

async function onFileSave(payload: any): Promise<any> {
  return DataService.saveFile(payload.filename, payload.content);
}

async function onFileLoad(payload: any): Promise<any> {
  return DataService.loadFile(payload.filename);
}

async function onMessage(message: AnalyticsMessage) {
  let responsePayload = null;
  let resolvedMethod = false;

  if(message.method === 'TASK_RESULT') {
    onTaskResult(JSON.parse(message.payload));
    resolvedMethod = true;
  }

  if(message.method === 'FILE_SAVE') {
    responsePayload = await onFileSave(message.payload);
    resolvedMethod = true;
  }
  if(message.method === 'FILE_LOAD') {
    responsePayload = await onFileLoad(message.payload); 
    resolvedMethod = true;
  }

  if(!resolvedMethod) {
    throw new TypeError('Unknown method ' + message.method);
  }

  // TODO: catch exception and send error in this case
  if(message.requestId !== undefined) {
    message.payload = responsePayload;
    analyticsService.sendMessage(message);
  }
}

export function init() {
  analyticsService = new AnalyticsService(onMessage);
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
    type: 'LEARN',
    pattern,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'SUCCESS') {
    AnalyticUnit.setStatus(id, 'READY');
    insertSegments(id, result.segments, false);
    AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  } else {
    AnalyticUnit.setStatus(id, 'FAILED', result.error);
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

  if(result.status === 'FAILED') {
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
