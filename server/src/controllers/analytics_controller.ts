import {
  AnalyticUnit,
  AnalyticUnitId,
  findById,
  setPredictionTime,
  setStatus
} from '../models/analytic_unit'
import { getTarget } from './metrics_controler';
import { getLabeledSegments, insertSegments, removeSegments } from './segments_controller'
import { AnalyticsConnection } from '../services/analytics_service'


const taskMap = {};
let nextTaskId = 0;

const analyticsConnection = new AnalyticsConnection(onResponse);

function onResponse(response: any) {
  let taskId = response.__task_id;
  let status = response.status;
  if(status === 'success' || status === 'failed') {
    if(taskId in taskMap) {
      let resolver = taskMap[taskId];
      resolver(response);
      delete taskMap[taskId];
    }
  }
}

async function runTask(task): Promise<any> {
  let anomaly: AnalyticUnit = findById(task.analyticUnitId);
  task.metric = {
    datasource: anomaly.metric.datasource,
    targets: anomaly.metric.targets.map(getTarget)
  };

  task.__task_id = nextTaskId++;
  await analyticsConnection.sendTask(task);

  return new Promise<void>(resolve => {
    taskMap[task.__task_id] = resolve;
  })
}

export async function runLearning(id: AnalyticUnitId) {
  let segments = getLabeledSegments(id);
  setStatus(id, 'learning');
  let anomaly: AnalyticUnit = findById(id);
  let pattern = anomaly.type;
  let task = {
    analyticUnitId: id,
    type: 'learn',
    pattern,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'success') {
    setStatus(id, 'ready');
    insertSegments(id, result.segments, false);
    setPredictionTime(id, result.lastPredictionTime);
  } else {
    setStatus(id, 'failed', result.error);
  }
}

export async function runPredict(id: AnalyticUnitId) {
  let unit: AnalyticUnit = findById(id);
  let pattern = unit.type;
  let task = {
    type: 'predict',
    predictor_id: id,
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
  setPredictionTime(id, result.last_prediction_time);
  return result.segments;
}
