import {
  Anomaly,
  AnomalyId, getAnomalyTypeInfo,
  loadAnomalyById,
  setAnomalyPredictionTime,
  setAnomalyStatus
} from './anomalyType'
import { getTarget } from './metrics';
import { getLabeledSegments, insertSegments, removeSegments } from './segments'
import { AnalyticsConnection } from './analyticsConnection'


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
  let anomaly: Anomaly = loadAnomalyById(task.anomaly_id);
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

export async function runLearning(anomalyId:AnomalyId) {
  let segments = getLabeledSegments(anomalyId);
  setAnomalyStatus(anomalyId, 'learning');
  let anomaly:Anomaly  = loadAnomalyById(anomalyId);
  let pattern = anomaly.pattern;
  let task = {
    type: 'learn',
    anomaly_id: anomalyId,
    pattern,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'success') {
    setAnomalyStatus(anomalyId, 'ready');
    insertSegments(anomalyId, result.segments, false);
    setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
  } else {
    setAnomalyStatus(anomalyId, 'failed', result.error);
  }
}

export async function runPredict(anomalyId:AnomalyId) {
  let anomaly:Anomaly = loadAnomalyById(anomalyId);
  let pattern = anomaly.pattern;
  let task = {
    type: 'predict',
    anomaly_id: anomalyId,
    pattern,
    last_prediction_time: anomaly.last_prediction_time
  };
  let result = await runTask(task);

  if(result.status === 'failed') {
    return [];
  }
  // Merging segments
  let segments = getLabeledSegments(anomalyId);
  if(segments.length > 0 && result.segments.length > 0) {
    let lastOldSegment = segments[segments.length - 1];
    let firstNewSegment = result.segments[0];

    if(firstNewSegment.start <= lastOldSegment.finish) {
      result.segments[0].start = lastOldSegment.start;
      removeSegments(anomalyId, [lastOldSegment.id]);
    }
  }

  insertSegments(anomalyId, result.segments, false);
  setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
  return result.segments;
}