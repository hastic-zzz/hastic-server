import { spawn } from 'child_process'
import { ANALYTICS_PATH } from '../config'
import {
  Anomaly,
  AnomalyId, getAnomalyTypeInfo,
  loadAnomalyById,
  setAnomalyPredictionTime,
  setAnomalyStatus
} from './anomalyType'
import { getTarget } from './metrics';
import { getLabeledSegments, insertSegments, removeSegments } from './segments';
import { split, mapSync } from 'event-stream';
import * as fs from 'fs';
import * as path from 'path';

var learnWorker;
if(fs.existsSync(path.join(ANALYTICS_PATH, 'dist/worker/worker'))) {
  learnWorker = spawn('dist/worker/worker', [], { cwd: ANALYTICS_PATH })
} else {
  // If compiled analytics script doesn't exist - fallback to regular python
  learnWorker = spawn('python3', ['worker.py'], { cwd: ANALYTICS_PATH })
}
learnWorker.stdout.pipe(split()).pipe(mapSync(onMessage));

learnWorker.stderr.on('data', data => console.error(`worker stderr: ${data}`));

const taskMap = {};
let nextTaskId = 0;

function onMessage(data) {
  console.log(`worker stdout: ${data}`);
  let response = JSON.parse(data);
  let taskId = response.__task_id;
  // let anomalyName = response.anomaly_name;
  // let task = response.task;
  let status = response.status;

  if(status === 'success' || status === 'failed') {
    if(taskId in taskMap) {
      let resolver = taskMap[taskId];
      resolver(response);
      delete taskMap[taskId];
    }
  }
}

function runTask(task) : Promise<any> {
  let anomaly:Anomaly = loadAnomalyById(task.anomaly_id);
  task.metric = {
    datasource: anomaly.metric.datasource,
    targets: anomaly.metric.targets.map(t => getTarget(t))
  };

  task.__task_id = nextTaskId++;
  let command = JSON.stringify(task)
  learnWorker.stdin.write(`${command}\n`);
  return new Promise<Object>((resolve, reject) => {
    taskMap[task.__task_id] = resolve
  })
}

async function runLearning(anomalyId:AnomalyId) {
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

async function runPredict(anomalyId:AnomalyId) {
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

export { runLearning, runPredict }
