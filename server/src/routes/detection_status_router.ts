import * as AnalyticsController from '../controllers/analytics_controller';
import { AnalyticUnitId } from '../models/analytic_unit_model';

import * as Router from 'koa-router';
import * as _ from 'lodash';

export enum DetectionState {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED'
}

declare type DetectionStatus = {
  id: AnalyticUnitId,
  from: number,
  to: number,
  state: DetectionState
}

declare type DetectionStatusResponse = {
  timeranges: DetectionStatus[]
}

let runnnedDetections: DetectionStatus[] = [];

export async function getDetectionStatus(ctx: Router.IRouterContext) {
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

  const previousRun = _.find(runnnedDetections, {id, from, to});
  if(previousRun !== undefined) {
    ctx.response.body = {
      timeranges: [
        previousRun
      ]
    }
  }

  const currentRun = {
    id,
    from,
    to,
    state: DetectionState.RUNNING
  };
  runnnedDetections.push(currentRun);
  
  AnalyticsController.runDetect(id, from, to)
    .then(() => _.find(runnnedDetections, {id, from, to}).state = DetectionState.READY)
    .catch(err => {
      console.error(err);
      _.find(runnnedDetections, {id, from, to}).state = DetectionState.FAILED;
    });

  ctx.response.body = {
    timeranges: [
      currentRun
    ]
  };
}

export const router = new Router();

router.get('/', getDetectionStatus);
