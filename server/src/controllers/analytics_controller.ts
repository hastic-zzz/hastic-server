import { AnalyticsMessageMethod, AnalyticsMessage } from '../models/analytics_message_model';
import { AnalyticsTask, AnalyticsTaskType, AnalyticsTaskId } from '../models/analytics_task_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as Segment from '../models/segment_model';
import * as AnalyticUnit from '../models/analytic_units';
import * as Detection from '../models/detection_model';
import { ThresholdAnalyticUnit } from '../models/analytic_units/threshold_analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';
import { AlertService } from '../services/alert_service';
import { HASTIC_API_KEY } from '../config';
import { DataPuller } from '../services/data_puller';
import { getGrafanaUrl } from '../utils/grafana';
import { getNonIntersectedSpans } from '../utils/spans';

import { queryByMetric, GrafanaUnavailable, DatasourceUnavailable } from 'grafana-datasource-kit';


import * as _ from 'lodash';
import { WebhookType } from '../services/notification_service';
import { AnomalyAnalyticUnit } from '../models/analytic_units/anomaly_analytic_unit_model';

const SECONDS_IN_MINUTE = 60;

type TaskResult = any;
type DetectionResult = any;
// TODO: move TableTimeSeries to grafana-datasource-kit
// TODO: TableTimeSeries is bad name
type TableTimeSeries = { values: [number, number][], columns: string[] };
// TODO: move type definitions somewhere
type TimeRange = { from: number, to: number };
export type TaskResolver = (taskResult: TaskResult) => void;

const taskResolvers = new Map<AnalyticsTaskId, TaskResolver>();

let analyticsService: AnalyticsService = undefined;
let alertService: AlertService = undefined;
let grafanaAvailableWebhok: Function = undefined;
let dataPuller: DataPuller;

let detectionsCount: number = 0;


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
  detectionsCount++;
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

export async function runTask(task: AnalyticsTask): Promise<TaskResult> {
  return new Promise<TaskResult>((resolver: TaskResolver) => {
    taskResolvers.set(task.id, resolver); // it will be resolved in onTaskResult()
    analyticsService.sendTask(task);      // we dont wait for result here
  });
}

async function getQueryRange(
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  detectorType: AnalyticUnit.DetectorType
): Promise<TimeRange> {
  let segments: Segment.Segment[];
  switch(detectorType) {
    case AnalyticUnit.DetectorType.PATTERN:
      segments = await Segment.findMany(analyticUnitId, { $or: { labeled: true, deleted: true } });
      if(segments.length === 0) {
        throw new Error('Need at least 1 labeled segment');
      }
      return getQueryRangeForLearningBySegments(segments);

    case AnalyticUnit.DetectorType.THRESHOLD:
      const now = Date.now();
      return {
        from: now - 5 * SECONDS_IN_MINUTE * 1000,
        to: now
      };

    case AnalyticUnit.DetectorType.ANOMALY:
      segments = await Segment.findMany(analyticUnitId, { $or: { labeled: true, deleted: true } });
      if(segments.length === 0) {
        const now = Date.now();
        return {
          from: now - 5 * SECONDS_IN_MINUTE * 1000,
          to: now
        };
      }
      else {
        return getQueryRangeForLearningBySegments(segments);
      }
    
    default:
      throw new Error(`Cannot get query range for detector type ${detectorType}`);
  }
}

async function query(
  analyticUnit: AnalyticUnit.AnalyticUnit,
  range: TimeRange
) {
  console.log(`query time range: from ${new Date(range.from)} to ${new Date(range.to)}`);

  const grafanaUrl = getGrafanaUrl(analyticUnit.grafanaUrl);
  let data;

  try {
    const queryResult = await queryByMetric(
      analyticUnit.metric,
      grafanaUrl,
      range.from,
      range.to,
      HASTIC_API_KEY
    );
    data = queryResult.values;
    grafanaAvailableWebhok(true);
  } catch(e) {
    if(e instanceof GrafanaUnavailable) {
      const msg = `Can't connect Grafana: ${e.message}, check GRAFANA_URL`;
      grafanaAvailableWebhok(false);
      throw new Error(msg);
    }
    if(e instanceof DatasourceUnavailable) {
      alertService.sendMsg(e.message, WebhookType.FAILURE);
      throw new Error(e.message);
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

export async function runLearning(id: AnalyticUnit.AnalyticUnitId, from?: number, to?: number) {
  console.log(`LEARNING started for ${id}`);
  try {

    let analyticUnit = await AnalyticUnit.findById(id);
    if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.LEARNING) {
      console.log(`cancel already started learning for ${id}, run new learning`);
      await cancelAnalyticsTask(id);
    }
    const oldSegments = await Segment.findMany(id, { labeled: false, deleted: false });
    // TODO: segments and spans are coupled. So their removing should be a transaction
    await Segment.removeSegments(oldSegments.map(segment => segment.id));
    await Detection.clearSpans(id);
    let oldCache = await AnalyticUnitCache.findById(id);
    if(oldCache !== null) {
      oldCache = oldCache.data;
    } else {
      await AnalyticUnitCache.create(id);
    }

    // TODO: create an analytics serialization method in AnalyticUnit
    let analyticUnitType = analyticUnit.type;
    const detector = analyticUnit.detectorType;
    let taskPayload: any = { detector, analyticUnitType, cache: oldCache };

    switch(detector) {
      case AnalyticUnit.DetectorType.PATTERN:
        let segments = await Segment.findMany(id, { labeled: true });
        if(segments.length === 0) {
          throw new Error('Need at least 1 labeled segment');
        }

        let segmentObjs = segments.map(s => s.toObject());

        let deletedSegments = await Segment.findMany(id, { deleted: true });
        let deletedSegmentsObjs = deletedSegments.map(s => s.toObject());
        segmentObjs = _.concat(segmentObjs, deletedSegmentsObjs);
        taskPayload.segments = segmentObjs;
        taskPayload.data = await getPayloadData(analyticUnit, from, to);
        break;
      case AnalyticUnit.DetectorType.THRESHOLD:
        taskPayload.threshold = {
          value: (analyticUnit as ThresholdAnalyticUnit).value,
          condition: (analyticUnit as ThresholdAnalyticUnit).condition
        };
        taskPayload.data = await getPayloadData(analyticUnit, from, to);
        break;
      case AnalyticUnit.DetectorType.ANOMALY:
        taskPayload.anomaly = {
          alpha: (analyticUnit as AnomalyAnalyticUnit).alpha,
          confidence: (analyticUnit as AnomalyAnalyticUnit).confidence
        };

        taskPayload.data = await getPayloadData(analyticUnit, from, to);

        const seasonality = (analyticUnit as AnomalyAnalyticUnit).seasonality;
        if(seasonality > 0) {
          let segments = await Segment.findMany(id, { deleted: true });
          if(segments.length === 0) {
            console.log('Need at least 1 labeled segment, ignore seasonality');
            break;
          }
          taskPayload.anomaly.seasonality = seasonality;

          let segmentObjs = segments.map(s => s.toObject());
          taskPayload.anomaly.segments = segmentObjs;
        }
        break;
      default:
        throw new Error(`Unknown type of detector: ${detector}`);
    }

    let task = new AnalyticsTask(
      id, AnalyticsTaskType.LEARN, taskPayload
    );
    AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.LEARNING);
    console.log(`run ${task.type} task, id:${id}`);
    let result = await runTask(task);
    if(result.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
      throw new Error(result.error);
    }
    // TODO: rename SUCCESS to something better
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.SUCCESS);
    await AnalyticUnitCache.setData(id, result.payload.cache);
  } catch (err) {
    const message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    throw new Error(message)
  }

}

export async function runDetect(id: AnalyticUnit.AnalyticUnitId, from?: number, to?: number) {
  let previousLastDetectionTime: number = undefined;
  let range: TimeRange;
  let intersection = 0;

  let oldCache = await AnalyticUnitCache.findById(id);
  if(oldCache !== null) {
    intersection = oldCache.getIntersection();
    oldCache = oldCache.data;
  } else {
    await AnalyticUnitCache.create(id);
  }

  try {
    let unit = await AnalyticUnit.findById(id);
    previousLastDetectionTime = unit.lastDetectionTime;
    let analyticUnitType = unit.type;
    const detector = unit.detectorType;

    if(from !== undefined && to !== undefined) {
      range = { from, to };
    } else {
      range = await getQueryRange(id, detector);
    }
    const data = await query(unit, range);

    let task = new AnalyticsTask(
      id,
      AnalyticsTaskType.DETECT,
      { detector, analyticUnitType, lastDetectionTime: unit.lastDetectionTime, data, cache: oldCache }
    );
    console.log(`run task, id:${id}`);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.DETECTION);
    const result = await runTask(task);

    if(result.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
      throw new Error(result.error);
    }

    const payload = await processDetectionResult(id, result.payload);
    const cache = AnalyticUnitCache.AnalyticUnitCache.fromObject({ _id: id, data: payload.cache });

    // TODO: uncomment it
    // It clears segments when redetecting on another timerange
    // await deleteNonDetectedSegments(id, payload);
    await Promise.all([
      Segment.insertSegments(payload.segments),
      AnalyticUnitCache.setData(id, payload.cache),
      AnalyticUnit.setDetectionTime(id, payload.lastDetectionTime),
    ]);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.READY);
    await Detection.insertSpan(
      new Detection.DetectionSpan(
        id,
        range.from + intersection,
        range.to - intersection,
        Detection.DetectionStatus.READY
      )
    );
  } catch(err) {
    // TODO: maybe we don't need to update detectionTime with previous value?
    if(previousLastDetectionTime !== undefined) {
      await AnalyticUnit.setDetectionTime(id, previousLastDetectionTime);
    }
    let message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    await Detection.insertSpan(
      new Detection.DetectionSpan(
        id,
        range.from + intersection,
        range.to - intersection,
        Detection.DetectionStatus.FAILED
      )
    );
  }
}

export async function remove(analyticUnitId: AnalyticUnit.AnalyticUnitId) {
  // We don't await for analytics task cancellation here
  // If we add await, the rest function will be executed only when analytics becomes up

  cancelAnalyticsTask(analyticUnitId);

  if(dataPuller !== undefined) {
    dataPuller.deleteUnit(analyticUnitId);
  }

  await AnalyticUnit.remove(analyticUnitId);
}

async function cancelAnalyticsTask(analyticUnitId: AnalyticUnit.AnalyticUnitId) {
  try {
    let task = new AnalyticsTask(analyticUnitId, AnalyticsTaskType.CANCEL);
    await runTask(task);
  } catch(e) {
    console.log(`Can't cancel analytics task for "${analyticUnitId}": ${e.message}`);
  }
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

export function getQueueLength() {
  return analyticsService.queueLength;
}

export function getTaskResolversLength(): number {
  return taskResolvers.size;
}

export function getDetectionsCount(): number {
  return detectionsCount;
}

export function isAnalyticReady(): boolean {
  return analyticsService.ready;
}

export function analyticsLastAlive(): Date {
  return analyticsService.lastAlive;
}

export async function getActiveWebhooks() {
  const analyticUnits = await AnalyticUnit.findMany({ alert: true });
  return analyticUnits.map(analyticUnit => analyticUnit.id);
}

export async function saveAnalyticUnitFromObject(obj: any): Promise<AnalyticUnit.AnalyticUnitId> {
  if(obj.datasource !== undefined) {
    obj.metric.datasource = obj.datasource;
  }
  const unit: AnalyticUnit.AnalyticUnit = AnalyticUnit.createAnalyticUnitFromObject(obj);
  const id = await AnalyticUnit.create(unit);

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
  await Segment.removeSegments(removedIds);
  const addedIds = await Segment.insertSegments(segmentsToInsert);

  return { addedIds };
}

export async function runLearningWithDetection(
  id: AnalyticUnit.AnalyticUnitId,
  from?: number,
  to?: number
): Promise<void> {
  // TODO: move setting status somehow "inside" learning
  await AnalyticUnit.setStatus(id, AnalyticUnit.AnalyticUnitStatus.PENDING);
  runLearning(id, from, to)
    .then(() => runDetect(id, from, to))
    .catch(err => console.error(err));
}

export async function getDetectionSpans(
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  from: number,
  to: number
): Promise<Detection.DetectionSpan[]> {
  const readySpans = await Detection.getIntersectedSpans(analyticUnitId, from, to, Detection.DetectionStatus.READY);
  const alreadyRunningSpans = await Detection.getIntersectedSpans(analyticUnitId, from, to, Detection.DetectionStatus.RUNNING);

  const analyticUnitCache = await AnalyticUnitCache.findById(analyticUnitId);

  if(_.isEmpty(readySpans)) {
    const span = await runDetectionOnExtendedSpan(analyticUnitId, from, to, analyticUnitCache);

    if(span === null) {
      return [];
    } else {
      return [span];
    }
  }

  const spanBorders = Detection.getSpanBorders(readySpans);

  let newDetectionSpans = getNonIntersectedSpans(from, to, spanBorders);
  if(newDetectionSpans.length === 0) {
    return [ new Detection.DetectionSpan(analyticUnitId, from, to, Detection.DetectionStatus.READY) ];
  }

  let runningSpansPromises = [];
  let newRunningSpans: Detection.DetectionSpan[] = [];
  runningSpansPromises = newDetectionSpans.map(async span => {
    const insideRunning = await Detection.findMany(analyticUnitId, {
      status: Detection.DetectionStatus.RUNNING,
      timeFromLTE: span.from,
      timeToGTE: span.to
    });

    if(_.isEmpty(insideRunning)) {
      const runningSpan = await runDetectionOnExtendedSpan(analyticUnitId, span.from, span.to, analyticUnitCache);
      newRunningSpans.push(runningSpan);
    }
  });

  await Promise.all(runningSpansPromises);

  return _.concat(readySpans, alreadyRunningSpans, newRunningSpans.filter(span => span !== null));
}

async function getPayloadData(
  analyticUnit: AnalyticUnit.AnalyticUnit,
  from: number,
  to:number
) {
  let range: TimeRange;
  if(from !== undefined && to !== undefined) {
    range = { from, to };
  } else {
    range = await getQueryRange(analyticUnit.id, analyticUnit.detectorType);
  }
  return await query(analyticUnit, range);
}

async function runDetectionOnExtendedSpan(
  analyticUnitId: AnalyticUnit.AnalyticUnitId,
  from: number,
  to: number,
  analyticUnitCache: AnalyticUnitCache.AnalyticUnitCache
): Promise<Detection.DetectionSpan> {
  if(analyticUnitCache === null) {
    return null;
  }

  const intersection = analyticUnitCache.getIntersection();

  const intersectedFrom = Math.max(from - intersection, 0);
  const intersectedTo = to + intersection;
  runDetect(analyticUnitId, intersectedFrom, intersectedTo);

  const detection = new Detection.DetectionSpan(
    analyticUnitId,
    from,
    to,
    Detection.DetectionStatus.RUNNING
  );
  await Detection.insertSpan(detection);
  return detection;
}

export async function getHSR(
  analyticUnit: AnalyticUnit.AnalyticUnit,
  from: number,
  to: number
): Promise<{
  hsr: TableTimeSeries,
  lowerBound?: TableTimeSeries,
  upperBound?: TableTimeSeries
}> {
  try {
    const grafanaUrl = getGrafanaUrl(analyticUnit.grafanaUrl);
    const data = await queryByMetric(analyticUnit.metric, grafanaUrl, from, to, HASTIC_API_KEY);

    if(analyticUnit.detectorType !== AnalyticUnit.DetectorType.ANOMALY) {
      return { hsr: data };
    }
    let cache = await AnalyticUnitCache.findById(analyticUnit.id);
    if(
      cache === null ||
      cache.data.alpha !== (analyticUnit as AnalyticUnit.AnomalyAnalyticUnit).alpha ||
      cache.data.confidence !== (analyticUnit as AnalyticUnit.AnomalyAnalyticUnit).confidence
    ) {
      await runLearning(analyticUnit.id, from, to);
      cache = await AnalyticUnitCache.findById(analyticUnit.id);
    }

    cache = cache.data;

    const analyticUnitType = analyticUnit.type;
    const detector = analyticUnit.detectorType;
    const payload = {
      data: data.values,
      analyticUnitType,
      detector,
      cache
    };

    const processingTask = new AnalyticsTask(analyticUnit.id, AnalyticsTaskType.PROCESS, payload);
    const result = await runTask(processingTask);
    if(result.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
      throw new Error(`Data processing error: ${result.error}`);
    }
    return {
      hsr: data,
      lowerBound: { values: result.payload.lowerBound, columns: data.columns },
      upperBound: { values: result.payload.upperBound, columns: data.columns }
    };
  } catch (err) {
    const message = err.message || JSON.stringify(err);
    await AnalyticUnit.setStatus(analyticUnit.id, AnalyticUnit.AnalyticUnitStatus.FAILED, message);
    throw new Error(message);
  }
}
