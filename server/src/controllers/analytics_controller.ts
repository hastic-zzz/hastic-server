import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as Segment from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';
import { sendWebhook } from '../services/notification_service';
import { HASTIC_API_KEY } from '../config'
import { DataPuller } from '../services/data_puller';

import { queryByMetric } from 'grafana-datasource-kit';


import * as _ from 'lodash';


type TaskResult = any;
type DetectionResult = any;
export type TaskResolver = (taskResult: TaskResult) => void;

const taskResolvers = new Map<AnalyticsTaskId, TaskResolver>();

let analyticsService: AnalyticsService = undefined;
let dataPuller: DataPuller;


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

function onDetect(detectionResult: DetectionResult) {
  processDetectionResult(detectionResult.analyticUnitId, detectionResult);
}

async function onMessage(message: AnalyticsMessage) {
  let responsePayload = null;
  let methodResolved = false;

  if(message.method === AnalyticsMessageMethod.TASK_RESULT) {
    onTaskResult(message.payload);
    methodResolved = true;
  }

  if(message.method === AnalyticsMessageMethod.DETECT) {
    onDetect(message.payload.payload);
    methodResolved = true;
  }

  if(!methodResolved) {
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
  dataPuller = new DataPuller(analyticsService);
  dataPuller.runPuller();
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
  if(segments.length === 0) {
    throw new Error('Need at least 1 labeled segment');
  }

  let from = _.minBy(segments, s => s.from).from;
  let to = _.maxBy(segments, s => s.to).to;
  let now = Date.now();
  let leftOffset = now - to;
  from -= Math.round(leftOffset);
  to = now;

  return { from, to };
}

export async function runLearning(id: AnalyticUnit.AnalyticUnitId) {
  console.debug('learning runned...');
  try {

    let analyticUnit = await AnalyticUnit.findById(id);
    if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.LEARNING) {
      throw new Error('Can`t starn learning when it`s already started [' + id + ']');
    }

    let segments = await Segment.findMany(id, { labeled: true });
    if(segments.length === 0) {
      throw new Error('Need at least 1 labeled segment');
    }

    let segmentObjs = segments.map(s => s.toObject());

    let { from, to } = getQueryRangeForLearningBySegments(segments);
    console.debug(`query time range: from ${new Date(from)} to ${new Date(to)}`);
    let queryResult = await queryByMetric(analyticUnit.metric, analyticUnit.panelUrl, from, to, HASTIC_API_KEY);
    let data = queryResult.values;
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

    let deletedSegments = await Segment.findMany(id, { deleted: true });
    let deletedSegmentsObjs = deletedSegments.map(s => s.toObject());
    segmentObjs = _.concat(segmentObjs, deletedSegmentsObjs);

    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, { pattern, segments: segmentObjs, data, cache: oldCache }
    );
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);
    console.debug(`run task, id:${id}`);
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

export async function runDetect(id: AnalyticUnit.AnalyticUnitId) {
  let previousLastDetectionTime: number = undefined;

  try {
    let unit = await AnalyticUnit.findById(id);
    previousLastDetectionTime = unit.lastDetectionTime;
    let pattern = unit.type;

    let segments = await Segment.findMany(id, { labeled: true });
    if(segments.length === 0) {
      throw new Error('Need at least 1 labeled segment');
    }

    let { from, to } = getQueryRangeForLearningBySegments(segments);
    console.debug(`query time range: from ${new Date(from)} to ${new Date(to)}`);
    let queryResult = await queryByMetric(unit.metric, unit.panelUrl, from, to, HASTIC_API_KEY);
    let data = queryResult.values;
    if(data.length === 0) {
      throw new Error('Empty data to detect on');
    }

    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }
    let task = new AnalyticsTask(
      id,
      AnalyticsTaskType.DETECT,
      { pattern, lastDetectionTime: unit.lastDetectionTime, data, cache: oldCache }
    );
    console.debug(`run task, id:${id}`);
    let result = await runTask(task);
    if(result.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
      return [];
    }

    let payload = await processDetectionResult(id, result.payload);

    // TODO: implement segments merging without removing labeled
    // if(segments.length > 0 && payload.segments.length > 0) {
    //   let lastOldSegment = segments[segments.length - 1];
    //   let firstNewSegment = payload.segments[0];

    //   if(firstNewSegment.from <= lastOldSegment.to) {
    //     payload.segments[0].from = lastOldSegment.from;
    //     Segment.removeSegments([lastOldSegment.id])
    //   }
    // }

    await deleteNonDetectedSegments(id, payload);

    Segment.insertSegments(payload.segments);
    AnalyticUnitCache.setData(id, payload.cache);
    AnalyticUnit.setDetectionTime(id, payload.lastDetectionTime);
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);
  } catch(err) {
    let message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    if(previousLastDetectionTime !== undefined) {
      await AnalyticUnit.setDetectionTime(id, previousLastDetectionTime);
    }
  }
}

export async function remove(id: AnalyticUnit.AnalyticUnitId) {
  let task = new AnalyticsTask(id, AnalyticsTaskType.CANCEL);
  await runTask(task);

  if(dataPuller !== undefined) {
    dataPuller.deleteUnit(id);
  }

  await AnalyticUnit.remove(id);
}

export async function deleteNonDetectedSegments(id, payload) {
  let lastDetectedSegments = await Segment.findMany(id, { labeled: false, deleted: false });
  let segmentsToRemove: Segment.Segment[];
  segmentsToRemove = _.differenceWith(lastDetectedSegments, payload.segments, (a, b: Segment.Segment) => a.equals(b));
  Segment.removeSegments(segmentsToRemove.map(s => s.id));
}

async function processDetectionResult(analyticUnitId: AnalyticUnit.AnalyticUnitId, detectionResult: DetectionResult): 
  Promise<{
    lastDetectionTime: number,
    segments: Segment.Segment[],
    cache: any
  }> {
  if(detectionResult.segments === undefined || !Array.isArray(detectionResult.segments)) {
    throw new Error(`Missing segments in result or it is corrupted: ${JSON.stringify(detectionResult)}`);
  }
  if(detectionResult.lastDetectionTime === undefined || isNaN(+detectionResult.lastDetectionTime)) {
    throw new Error(
      `Missing lastDetectionTime in result or it is corrupted: ${JSON.stringify(detectionResult)}`
    );
  }

  const segments = detectionResult.segments.map(
    segment => new Segment.Segment(analyticUnitId, segment.from, segment.to, false, false)
  );
  const analyticUnit = await AnalyticUnit.findById(analyticUnitId);
  if(analyticUnit.alert) {
    if(!_.isEmpty(segments)) {
      try {
        sendWebhook(analyticUnit.name, _.last(segments));
      } catch(err) {
        console.error(`Error while sending webhook: ${err.message}`);
      }
    }
  }
  return {
    lastDetectionTime: detectionResult.lastDetectionTime,
    segments: segments,
    cache: detectionResult.cache
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

export async function setAlert(analyticUnitId: AnalyticUnit.AnalyticUnitId, alert: boolean) {
  AnalyticUnit.setAlert(analyticUnitId, alert);
  if(dataPuller !== undefined) {
    if(alert) {
      const analyticUnit = await AnalyticUnit.findById(analyticUnitId);
      dataPuller.addUnit(analyticUnit);
    } else {
      dataPuller.deleteUnit(analyticUnitId);
    }
  }
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
  runLearning(id).then(() => runDetect(id));
  return { addedIds, removed };
}
