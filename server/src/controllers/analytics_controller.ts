import * as SegmentsController from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_unit_model'
import { AnalyticsService, AnalyticsMessage } from '../services/analytics_service';


const taskMap = new Map<string, any>();
let nextTaskId = 0;

let analyticsService: AnalyticsService = undefined;


function onTaskResult(taskResult: any) {
  let taskId = taskResult._taskId;
  let status = taskResult.status;
  if(status === 'SUCCESS' || status === 'FAILED') {
    if(taskId in taskMap) {
      let resolver: any = taskMap.get(taskId);
      resolver(taskResult);
      taskMap.delete(taskId);
    }
  }
}

async function onMessage(message: AnalyticsMessage) {
  let responsePayload = null;
  let resolvedMethod = false;

  if(message.method === 'TASK_RESULT') {
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

async function runTask(task: any): Promise<any> {
  // let anomaly: AnalyticUnit.AnalyticUnit = await AnalyticUnit.findById(task.analyticUnitId);
  // task.metric = {
  //   datasource: anomaly.metric.datasource,
  //   targets: anomaly.metric.targets.map(getTarget)
  // };

  // task._taskId = nextTaskId++;
  // await analyticsService.sendTask(task);

  // return new Promise<void>(resolve => {
  //   taskMap[task._taskId] = resolve;
  // })
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {
  // let segments = getLabeledSegments(id);
  // AnalyticUnit.setStatus(id, 'LEARNING');
  // let unit = await AnalyticUnit.findById(id);
  // let pattern = unit.type;
  // let task = {
  //   analyticUnitId: id,
  //   type: 'LEARN',
  //   pattern,
  //   segments: segments
  // };

  // let result = await runTask(task);

  // if (result.status === 'SUCCESS') {
  //   AnalyticUnit.setStatus(id, 'READY');
  //   insertSegments(id, result.segments, false);
  //   AnalyticUnit.setPredictionTime(id, result.lastPredictionTime);
  // } else {
  //   AnalyticUnit.setStatus(id, 'FAILED', result.error);
  // }
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