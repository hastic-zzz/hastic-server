import * as AnalyticsController from '../controllers/analytics_controller';
import { AnalyticUnitId } from '../models/analytic_unit_model';

import * as Router from 'koa-router';
import * as _ from 'lodash';


// TODO: move this to analytics_controller
export enum DetectionStatus {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED'
}

// TODO: move this to analytics_controller
declare type DetectionSpan = {
  id: AnalyticUnitId,
  from: number,
  to: number,
  status: DetectionStatus
}

declare type DetectionSpansResponse = {
  spans: DetectionSpan[]
}

// TODO: move this to analytics_controller
let runningDetectionSpans: DetectionSpan[] = [];

export async function getDetectionSpans(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }

  let from: number = +ctx.request.query.from;
  if(isNaN(from) || ctx.request.query.from === '') {
    throw new Error(`from is missing or corrupted (got ${ctx.request.query.from})`);
  }
  let to: number = +ctx.request.query.to;
  if(isNaN(to) || ctx.request.query.to === '') {
    throw new Error(`to is missing or corrupted (got ${ctx.request.query.to})`);
  }

  let response: DetectionSpansResponse = { spans: [] }

  // TODO: move this to analytics_controller
  // TODO: what if we are inside a running span?
  // TODO: this find will not find anything because of status field, use an id instead
  const previousRun = _.find(runningDetectionSpans, { id, from, to });
  if(previousRun !== undefined) {
    response.spans.push(previousRun);
  }

  const currentRun: DetectionSpan = { id, from, to, status: DetectionStatus.RUNNING };
  runningDetectionSpans.push(currentRun);

  // TODO: move this to analytics_controller
  AnalyticsController.runDetect(id, from, to)
    .then(() => {
      // TODO: this find will not find anything because of status field, use an id instead
      _.find(runningDetectionSpans, { id, from, to }).status = DetectionStatus.READY
    })
    .catch(err => {
      console.error(err);
      // TODO: this find will not find anything because of status field, use an id instead
      _.find(runningDetectionSpans, { id, from, to }).status = DetectionStatus.FAILED;
    });

  ctx.response.body = response;
}

export const router = new Router();

router.get('/spans', getDetectionSpans);
