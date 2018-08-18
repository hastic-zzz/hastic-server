import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model'
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as Segments from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';


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
    if(id in taskResolvers) {
      let resolver: any = taskResolvers.get(id);
      resolver(taskResult);
      taskResolvers.delete(id);
    } else {
      throw new Error(`TaskResut [${id}] has no resolver`);
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
  // task.metric = {
  //   datasource: anomaly.metric.datasource,
  //   targets: anomaly.metric.targets.map(getTarget)
  // };
  
  return new Promise<TaskResult>((resolver: TaskResolver) => {
    taskResolvers.set(task.id, resolver); // it will be resolved in onTaskResult()
    analyticsService.sendTask(task);      // we dont wait for result here
  });
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {
  
  let previousLastPredictionTime: number = undefined;

  try {
    let segments = await Segments.findMany(id, { labeled: true });
    let segmentObjs = segments.map(s => s.toObject());

    let analyticUnit = await AnalyticUnit.findById(id);
    if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.LEARNING) {
      throw new Error('Can`t starn learning when it`s already started [' + id + ']');
    }

    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);

    let pattern = analyticUnit.type;
    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, { pattern, segments: segmentObjs }
    );
    let result = await runTask(task);
    let { lastPredictionTime, segments: predictedSegments } = await processLearningResult(result);
    previousLastPredictionTime = analyticUnit.lastPredictionTime;

    await Promise.all([
      Segments.insertSegments(predictedSegments),
      AnalyticUnit.setPredictionTime(id, lastPredictionTime)
    ]);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);

  } catch (err) {
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, err);
    if(previousLastPredictionTime !== undefined) {
      await AnalyticUnit.setPredictionTime(id, previousLastPredictionTime);
    }
  }

}

async function processLearningResult(taskResult: any): Promise<{
  lastPredictionTime: number,
  segments: Segments.Segment[]
}> {
  if(taskResult.status !== 'SUCCESS') {
    return Promise.reject(taskResult.error);
  }
  if(taskResult.segments === undefined || !Array.isArray(taskResult.segments)) {
    throw new Error('Missing segments is result or it is corrupted: ' + taskResult);
  }
  if(taskResult.lastPredictionTime === undefined || isNaN(+taskResult.lastPredictionTime)) {
    throw new Error(
      'Missing lastPredictionTime is result or it is corrupted: ' + taskResult.lastPredictionTime
    );
  }

  return {
    lastPredictionTime: +taskResult.lastPredictionTime,
    segments: taskResult.segments.map(Segments.Segment.fromObject)
  };

}

export async function runPredict(id: AnalyticUnit.AnalyticUnitId) {
  // let unit = await AnalyticUnit.findById(id);
  // let pattern = unit.type;
  // let task = {
  //   type: 'PREDICT',
  //   analyticUnitId: id,
  //   pattern,
  //   lastPredictionTime: unit.lastPredictionTime
  // };
  // let result = await runTask(task);

  // if(result.status === 'FAILED') {
  //   return [];
  // }
  // // Merging segments
  // let segments = getLabeledSegments(id);
  // if(segments.length > 0 && result.segments.length > 0) {
  //   let lastOldSegment = segments[segments.length - 1];
  //   let firstNewSegment = result.segments[0];

  //   if(firstNewSegment.start <= lastOldSegment.finish) {
  //     result.segments[0].start = lastOldSegment.start;
  //     removeSegments(id, [lastOldSegment.id]);
  //   }
  // }

  // insertSegments(id, result.segments, false);
  // AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  // return result.segments;
}

export function isAnalyticReady(): boolean {
  return analyticsService.ready;
}

export async function createAnalyticUnitFromObject(obj: any): Promise<AnalyticUnit.AnalyticUnitId> {
  let unit: AnalyticUnit.AnalyticUnit = AnalyticUnit.AnalyticUnit.fromObject(obj);
  let id = await AnalyticUnit.create(unit);
  // runLearning(unit);
  return id;
}