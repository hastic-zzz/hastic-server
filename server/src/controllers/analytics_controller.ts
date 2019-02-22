import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as Segment from '../models/segment_model';
import * as Threshold from '../models/threshold_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';
import { AlertService } from '../services/alert_service';
import { HASTIC_API_KEY, GRAFANA_URL } from '../config';
import { DataPuller } from '../services/data_puller';

import { queryByMetric, ConnectionRefused } from 'grafana-datasource-kit';


import * as _ from 'lodash';

const SECONDS_IN_MINUTE = 60;

type TaskResult = any;
type DetectionResult = any;
export type TaskResolver = (taskResult: TaskResult) => void;

const taskResolvers = new Map<AnalyticsTaskId, TaskResolver>();

let analyticsService: AnalyticsService = undefined;
let alertService: AlertService = undefined;
let grafanaAvailableWebhok: Function = undefined;
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

async function onDetect(detectionResult: DetectionResult) {
  let id = detectionResult.analyticUnitId;
  let payload = await processDetectionResult(id, detectionResult);
  await Promise.all([
    Segment.insertSegments(payload.segments),
    AnalyticUnitCache.setData(id, payload.cache),
    AnalyticUnit.setDetectionTime(id, payload.lastDetectionTime),
  ]);
}

async function onMessage(message: AnalyticsMessage) {
  let responsePayload = null;
  let methodResolved = false;

  if(message.method === AnalyticsMessageMethod.TASK_RESULT) {
    onTaskResult(message.payload);
    methodResolved = true;
  }

  if(message.method === AnalyticsMessageMethod.DETECT) {
    await onDetect(message.payload.payload);
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

  alertService = new AlertService();
  grafanaAvailableWebhok = alertService.getGrafanaAvailableReporter();
  alertService.startAlerting();

  dataPuller = new DataPuller(analyticsService);
  dataPuller.runPuller();
}

export function terminate() {
  analyticsService.close();
  alertService.stopAlerting();
}

async function runTask(task: AnalyticsTask): Promise<TaskResult> {
  return new Promise<TaskResult>((resolver: TaskResolver) => {
    taskResolvers.set(task.id, resolver); // it will be resolved in onTaskResult()
    analyticsService.sendTask(task);      // we dont wait for result here
  });
}

async function query(analyticUnit: AnalyticUnit.AnalyticUnit, detector: AnalyticUnit.DetectorType) {
  let range;
  if(detector === AnalyticUnit.DetectorType.PATTERN) {
    const segments = await Segment.findMany(analyticUnit.id, { labeled: true });
    if(segments.length === 0) {
      throw new Error('Need at least 1 labeled segment');
    }

    range = getQueryRangeForLearningBySegments(segments);
  } else if(detector === AnalyticUnit.DetectorType.THRESHOLD) {
    const now = Date.now();
    range = {
      from: now - 5 * SECONDS_IN_MINUTE * 1000,
      to: now
    };
  }
  console.log(`query time range: from ${new Date(range.from)} to ${new Date(range.to)}`);

  let panelUrl;
  if(GRAFANA_URL !== null) {
    panelUrl = GRAFANA_URL; 
  } else {
    panelUrl = analyticUnit.panelUrl;
  }

  let data;

  try {
    const queryResult = await queryByMetric(
      analyticUnit.metric,
      panelUrl,
      range.from,
      range.to,
      HASTIC_API_KEY
    );
    data = queryResult.values;
    grafanaAvailableWebhok(true);
  } catch(e) {
    if(e instanceof ConnectionRefused) {
      const msg = `Can't connect Grafana: ${e.message}, check GRAFANA_URL`;
      grafanaAvailableWebhok(false);
      throw new Error(msg);
    }
    throw e;
  }

  if(data.length === 0) {
    throw new Error('Empty data to detect on');
  }
  return data;
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
  console.log('learning started...');
  try {

    let analyticUnit = await AnalyticUnit.findById(id);
    if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.LEARNING) {
      throw new Error('Can`t start learning when it`s already started [' + id + ']');
    }

    if(!isAnalyticReady()) {
      throw new Error('Analytics is not ready');
    }

    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }

    let analyticUnitType = analyticUnit.type;
    let detector = AnalyticUnit.getDetectorByType(analyticUnitType);
    let taskPayload: any = { detector, analyticUnitType, cache: oldCache };

    if(detector === AnalyticUnit.DetectorType.PATTERN) {
      let segments = await Segment.findMany(id, { labeled: true });
      if(segments.length === 0) {
        throw new Error('Need at least 1 labeled segment');
      }

      let segmentObjs = segments.map(s => s.toObject());

      let deletedSegments = await Segment.findMany(id, { deleted: true });
      let deletedSegmentsObjs = deletedSegments.map(s => s.toObject());
      segmentObjs = _.concat(segmentObjs, deletedSegmentsObjs);
      taskPayload.segments = segmentObjs;
    } else if(detector === AnalyticUnit.DetectorType.THRESHOLD) {
      const threshold = await Threshold.findOne(id);
      taskPayload.threshold = threshold;
    }

    taskPayload.data = await query(analyticUnit, detector);

    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, taskPayload
    );
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);
    console.log(`run task, id:${id}`);
    let result = await runTask(task);
    if(result.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
      throw new Error(result.error);
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
    if(!isAnalyticReady()) {
      throw new Error('Analytics is not ready');
    }

    let unit = await AnalyticUnit.findById(id);
    previousLastDetectionTime = unit.lastDetectionTime;
    let analyticUnitType = unit.type;
    let detector = AnalyticUnit.getDetectorByType(analyticUnitType);

    const data = await query(unit, detector);

    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }
    let task = new AnalyticsTask(
      id,
      AnalyticsTaskType.DETECT,
      { detector, analyticUnitType, lastDetectionTime: unit.lastDetectionTime, data, cache: oldCache }
    );
    console.log(`run task, id:${id}`);
    let result = await runTask(task);
    if(result.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
      throw new Error(result.error);
    }

    let payload = await processDetectionResult(id, result.payload);

    await deleteNonDetectedSegments(id, payload);

    await Promise.all([
      Segment.insertSegments(payload.segments),
      AnalyticUnitCache.setData(id, payload.cache),
      AnalyticUnit.setDetectionTime(id, payload.lastDetectionTime),
    ]);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);
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
  console.log(`got detection result for ${analyticUnitId} with ${detectionResult.segments.length} segments`);

  const sortedSegments: {from, to}[] = _.sortBy(detectionResult.segments, 'from');
  const segments = sortedSegments.map(
    segment => new Segment.Segment(analyticUnitId, segment.from, segment.to, false, false)
  );
  const analyticUnit = await AnalyticUnit.findById(analyticUnitId);
  if (!_.isEmpty(segments) && analyticUnit.alert) {
    try {
      alertService.receiveAlert(analyticUnit, _.last(segments));
    } catch(err) {
      console.error(`error while sending webhook: ${err.message}`);
    }
  } else {
    let reasons = [];
    if(!analyticUnit.alert) {
      reasons.push('alerting disabled');
    }
    if(_.isEmpty(segments)) {
      reasons.push('segments empty');
    }
    console.log(`skip sending webhook for ${analyticUnit.id}, ${reasons.join(', ')}`);
  }
  return {
    lastDetectionTime: detectionResult.lastDetectionTime,
    segments,
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
      alertService.addAnalyticUnit(analyticUnit);
    } else {
      dataPuller.deleteUnit(analyticUnitId);
      alertService.removeAnalyticUnit(analyticUnitId);
    }
  }
}

export async function setMetric(analyticUnitId: AnalyticUnit.AnalyticUnitId, metric: any, datasource: any) {
  metric.datasource = datasource;
  AnalyticUnit.setMetric(analyticUnitId, metric);
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

  runFirstLearning(id);
  return { addedIds, removed };
}

export async function updateThreshold(
  id: AnalyticUnit.AnalyticUnitId,
  value: number,
  condition: Threshold.Condition
) {
  await Threshold.updateThreshold(id, value, condition);

  runFirstLearning(id);
}

async function runFirstLearning(id: AnalyticUnit.AnalyticUnitId) {
  // TODO: move setting status somehow "inside" learning
  await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.PENDING);
  runLearning(id)
    .then(() => runDetect(id));
}
