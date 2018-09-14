import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
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
  from -= Math.round(diff);
  to = Date.now();

  return { from, to };
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {
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
    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }
    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, { pattern, segments: segmentObjs, data, cache: oldCache }
    );
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);
    let result = await runTask(task);
    if(result.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
      throw new Error(result.error)
    }
    await AnalyticUnitCache.setData(id, result.payload.cache);
  } catch (err) {
    let message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
  }

}

export async function runPredict(id: AnalyticUnit.AnalyticUnitId) {
  let previousLastPredictionTime: number = undefined;

  try {
    let unit = await AnalyticUnit.findById(id);
    previousLastPredictionTime = unit.lastPredictionTime;
    let pattern = unit.type;

    let segments = await Segment.findMany(id, { labeled: true });
    if(segments.length < 2) {
      throw new Error('Need at least 2 labeled segments');
    }

    let { from, to } = getQueryRangeForLearningBySegments(segments);
    let data = await queryByMetric(unit.metric, unit.panelUrl, from, to);
    if(data.length === 0) {
      throw new Error('Empty data to predict on');
    }

    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }
    let task = new AnalyticsTask(
      id,
      AnalyticsTaskType.PREDICT,
      { pattern, lastPredictionTime: unit.lastPredictionTime, data, cache: oldCache }
    );
    let result = await runTask(task);
    if(result.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
      return [];
    }

    let payload = processPredictionResult(id, result);

    // TODO: implement segments merging without removing labeled
    // if(segments.length > 0 && payload.segments.length > 0) {
    //   let lastOldSegment = segments[segments.length - 1];
    //   let firstNewSegment = payload.segments[0];

    //   if(firstNewSegment.from <= lastOldSegment.to) {
    //     payload.segments[0].from = lastOldSegment.from;
    //     Segment.removeSegments([lastOldSegment.id])
    //   }
    // }

    Segment.insertSegments(payload.segments);
    AnalyticUnitCache.setData(id, payload.cache);
    AnalyticUnit.setPredictionTime(id, payload.lastPredictionTime);
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);
  } catch(err) {
    let message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    if(previousLastPredictionTime !== undefined) {
      await AnalyticUnit.setPredictionTime(id, previousLastPredictionTime);
    }
  }
}

function processPredictionResult(analyticUnitId: AnalyticUnit.AnalyticUnitId, taskResult: any): {
  lastPredictionTime: number,
  segments: Segment.Segment[],
  cache: any
} {
  let payload = taskResult.payload;
  if (payload === undefined) {
    throw new Error(`Missing payload in result: ${taskResult}`);
  }
  if (payload.segments === undefined || !Array.isArray(payload.segments)) {
    throw new Error(`Missing segments in result or it is corrupted: ${JSON.stringify(payload)}`);
  }
  if (payload.lastPredictionTime === undefined || isNaN(+payload.lastPredictionTime)) {
    throw new Error(
      `Missing lastPredictionTime is result or it is corrupted: ${JSON.stringify(payload)}`
    );
  }

  let segments = payload.segments.map(segment => new Segment.Segment(analyticUnitId, segment.from, segment.to, false, false));

  return {
    lastPredictionTime: payload.lastPredictionTime,
    segments: segments,
    cache: payload.cache
  };

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
    Segment.setSegmentsDeleted(removedIds)
  ]);
  removed = removed.map(s => s._id);

  // TODO: move setting status somehow "inside" learning
  await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.PENDING);
  runLearning(id).then(() => runPredict(id));
  return { addedIds, removed };
}
