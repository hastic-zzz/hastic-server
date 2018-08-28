import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as Segment from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';
import { queryByMetric } from '../services/grafana_service';

import * as _ from 'lodash';


type TaskResult = any;
export type TaskResolver = (taskResult: TaskResult) => void;

const taskResolvers = new Map<AnalyticsTaskId, TaskResolver>();

let analyticsService: AnalyticsService = undefined;


function onTaskResult(taskResult: TaskResult) {
  let id = taskResult._id;
  if(id === undefined) {
    throw new Error('id of task is undefined');
  }
  let status = taskResult.status;
  if(status === 'SUCCESS' || status === 'FAILED') {
    if(taskResolvers.has(id)) {
      let resolver: any = taskResolvers.get(id);
      resolver(taskResult);
      taskResolvers.delete(id);
    } else {
      throw new Error(`TaskResult [${id}] has no resolver`);
    }
  }
}

async function onMessage(message: AnalyticsMessage) {
  let responsePayload = null;
  let resolvedMethod = false;

  if(message.method === AnalyticsMessageMethod.TASK_RESULT) {
    onTaskResult(message.payload);
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

async function runTask(task: AnalyticsTask): Promise<TaskResult> {
  return new Promise<TaskResult>((resolver: TaskResolver) => {
    taskResolvers.set(task.id, resolver); // it will be resolved in onTaskResult()
    analyticsService.sendTask(task);      // we dont wait for result here
  });
}

/**
 * Finds range for selecting subset for learning
 * @param segments labeled segments
 */
function getQueryRangeForLearningBySegments(segments: Segment.Segment[]) {
  if(segments.length < 2) {
    throw new Error('Need at least 2 labeled segments');
  }

  let from = _.minBy(segments, s => s.from).from;
  let to = _.maxBy(segments, s => s.to).to;
  let diff = to - from;
  from -= Math.round(diff * 0.1);
  to += Math.round(diff * 0.1);

  return { from, to };
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {

  let previousLastPredictionTime: number = undefined;

  try {

    let analyticUnit = await AnalyticUnit.findById(id);
    if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.LEARNING) {
      throw new Error('Can`t starn learning when it`s already started [' + id + ']');
    }

    let segments = await Segment.findMany(id, { labeled: true });
    if(segments.length < 2) {
      throw new Error('Need at least 2 labeled segments');
    }

    let segmentObjs = segments.map(s => s.toObject());

    let { from, to } = getQueryRangeForLearningBySegments(segments);
    let data = await queryByMetric(analyticUnit.metric, analyticUnit.panelUrl, from, to);
    if(data.length === 0) {
      throw new Error('Empty data to learn on');
    }

    let pattern = analyticUnit.type;
    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, { pattern, segments: segmentObjs, data }
    );
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);
    let result = await runTask(task);
    let { lastPredictionTime, segments: predictedSegments } = await processLearningResult(result);
    previousLastPredictionTime = analyticUnit.lastPredictionTime;

    await Promise.all([
      Segment.insertSegments(predictedSegments),
      AnalyticUnit.setPredictionTime(id, lastPredictionTime)
    ]);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);
    return Promise.resolve()
  } catch (err) {
    let message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    if(previousLastPredictionTime !== undefined) {
      await AnalyticUnit.setPredictionTime(id, previousLastPredictionTime);
    }

    return Promise.reject()
  }

}

async function processLearningResult(taskResult: any): Promise<{
  lastPredictionTime: number,
  segments: Segment.Segment[]
}> {
  if(taskResult.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
    return Promise.reject(taskResult.error);
  }
  console.log(taskResult)
  // if(taskResult.segments === undefined || !Array.isArray(taskResult.segments)) {
  //   throw new Error('Missing segments in result or it is corrupted: ' + taskResult);
  // }
  // if(taskResult.lastPredictionTime === undefined || isNaN(+taskResult.lastPredictionTime)) {
  //   throw new Error(
  //     'Missing lastPredictionTime is result or it is corrupted: ' + taskResult.lastPredictionTime
  //   );
  // }

  return Promise.resolve({
    lastPredictionTime: 0,
    segments: []
  })

}

export async function runPredict(id: AnalyticUnit.AnalyticUnitId) {
  let unit = await AnalyticUnit.findById(id);
  let pattern = unit.type;

  let segments = await Segment.findMany(id, { labeled: true });
  if (segments.length < 2) {
    throw new Error('Need at least 2 labeled segments');
  }

  let { from, to } = getQueryRangeForLearningBySegments(segments);
  let data = await queryByMetric(unit.metric, unit.panelUrl, from, to);
  if (data.length === 0) {
    throw new Error('Empty data to predict on');
  }

  let task = new AnalyticsTask(
    id,
    AnalyticsTaskType.PREDICT,
    { pattern, lastPredictionTime: unit.lastPredictionTime, data }
  );
  console.log(task)
  let result = await runTask(task);
  console.log(result)
  if(result.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
    return [];
  }
  // Merging segments
  if(segments.length > 0 && result.segments.length > 0) {
    let lastOldSegment = segments[segments.length - 1];
    let firstNewSegment = result.segments[0];

    if(firstNewSegment.from <= lastOldSegment.to) {
      result.segments[0].from = lastOldSegment.from;
      Segment.removeSegments([lastOldSegment.id])
    }
  }

  Segment.insertSegments(result.segments);
  AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  return result.segments;
}

export function isAnalyticReady(): boolean {
  return analyticsService.ready;
}

export async function createAnalyticUnitFromObject(obj: any): Promise<AnalyticUnit.AnalyticUnitId> {
  if(obj.datasource !== undefined) {
    obj.metric.datasource = obj.datasource;
  }
  let unit: AnalyticUnit.AnalyticUnit = AnalyticUnit.AnalyticUnit.fromObject(obj);
  let id = await AnalyticUnit.create(unit);
  return id;
}

export async function updateSegments(
  id: AnalyticUnit.AnalyticUnitId,
  segmentsToInsert: Segment.Segment[],
  removedIds: Segment.SegmentId[]
) {
  let [addedIds, removed] = await Promise.all([
    Segment.insertSegments(segmentsToInsert),
    Segment.removeSegments(removedIds)
  ]);
  // TODO: move setting status somehow "inside" learning
  await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.PENDING);
  runLearning(id).then(() => runPredict(id));
  return { addedIds, removed };
}
