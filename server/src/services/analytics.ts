import {
  AnalyticUnit,
  AnalyticUnitId, getAnomalyTypeInfo,
  loadById,
  setPredictionTime,
  setAnomalyStatus
} from '../models/analytic_unit'
import { getTarget } from './metrics';
import { getLabeledSegments, insertSegments, removeSegments } from './segments'
import { AnalyticsConnection } from './analytics_connection'


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
  let anomaly: AnalyticUnit = loadById(task.predictor_id);
  task.metric = {
    datasource: anomaly.metric.datasource,
    targets: anomaly.metric.targets.map(t => getTarget(t))
  };

  task.__task_id = nextTaskId++;
  await analyticsConnection.sendTask(task);

  return new Promise<void>(resolve => {
    taskMap[task.__task_id] = resolve;
  })
}

export async function runLearning(predictorId:AnalyticUnitId) {
  let segments = getLabeledSegments(predictorId);
  setAnomalyStatus(predictorId, 'learning');
  let anomaly:AnalyticUnit  = loadById(predictorId);
  let pattern = anomaly.type;
  let task = {
    type: 'learn',
    predictor_id: predictorId,
    pattern,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'success') {
    setAnomalyStatus(predictorId, 'ready');
    insertSegments(predictorId, result.segments, false);
    setPredictionTime(predictorId, result.last_prediction_time);
  } else {
    setAnomalyStatus(predictorId, 'failed', result.error);
  }
}

export async function runPredict(predictorId:AnalyticUnitId) {
  let anomaly:AnalyticUnit = loadById(predictorId);
  let pattern = anomaly.type;
  let task = {
    type: 'predict',
    predictor_id: predictorId,
    pattern,
    last_prediction_time: anomaly.lastPredictionTime
  };
  let result = await runTask(task);

  if(result.status === 'failed') {
    return [];
  }
  // Merging segments
  let segments = getLabeledSegments(predictorId);
  if(segments.length > 0 && result.segments.length > 0) {
    let lastOldSegment = segments[segments.length - 1];
    let firstNewSegment = result.segments[0];

    if(firstNewSegment.start <= lastOldSegment.finish) {
      result.segments[0].start = lastOldSegment.start;
      removeSegments(predictorId, [lastOldSegment.id]);
    }
  }

  insertSegments(predictorId, result.segments, false);
  setPredictionTime(predictorId, result.last_prediction_time);
  return result.segments;
}
