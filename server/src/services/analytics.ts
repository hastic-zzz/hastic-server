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
import { split, map, mapSync } from 'event-stream'

const learnWorker = spawn('python3', ['worker.py'], { cwd: ANALYTICS_PATH })
learnWorker.stdout.pipe(split())
  .pipe(
    mapSync(function(line){
      console.log(line)
      onMessage(line)
    })
  );

learnWorker.stderr.on('data', data => console.error(`worker stderr: ${data}`));

const taskMap = {};
let nextTaskId = 0;

function onMessage(data) {
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
  let analyticsType = "anomalies";
  let preset = undefined;
  if (anomaly.name.includes("jumps")) {
    analyticsType = "patterns";
    preset = "steps"
  }
  if (anomaly.name.includes("cliffs") || anomaly.name.includes("drops")) {
    analyticsType = "patterns";
    preset = "cliffs"
  }
  if (anomaly.name.includes("peaks")) {
    analyticsType = "patterns";
    preset = "peaks"
  }
  let task = {
    type: 'learn',
    anomaly_id: anomalyId,
    analytics_type: analyticsType,
    preset,
    segments: segments
  };

  let result = await runTask(task);

  if (result.status === 'success') {
    setAnomalyStatus(anomalyId, 'ready');
    insertSegments(anomalyId, result.segments, false);
    setAnomalyPredictionTime(anomalyId, result.last_prediction_time);
  } else {
    setAnomalyStatus(anomalyId, 'failed');
  }
}

async function runPredict(anomalyId:AnomalyId) {
  let anomaly:Anomaly = loadAnomalyById(anomalyId);
  let analyticsType = "anomalies";
  let preset = undefined;
  if (anomaly.name.includes("jump")) {
    analyticsType = "patterns";
    preset = "steps"
  }
  if (anomaly.name.includes("cliffs") || anomaly.name.includes("drops")) {
    analyticsType = "patterns";
    preset = "cliffs"
  }
  if (anomaly.name.includes("peaks")) {
    analyticsType = "patterns";
    preset = "peaks"
  }
  let task = {
    type: 'predict',
    anomaly_id: anomalyId,
    analytics_type: analyticsType,
    preset,
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
