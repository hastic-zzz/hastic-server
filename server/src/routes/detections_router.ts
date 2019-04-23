import * as AnalyticsController from '../controllers/analytics_controller';
import { AnalyticUnitId } from '../models/analytic_unit_model';
import { DetectionSpan } from '../models/detection_model';

import * as Router from 'koa-router';


declare type DetectionSpansResponse = {
  spans: DetectionSpan[]
}

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

  let response: DetectionSpansResponse = { spans: [] };
  // TODO: invalidate
  response.spans = await AnalyticsController.getDetectionSpans(id, from, to);
  ctx.response.body = response;
}

export const router = new Router();

router.get('/spans', getDetectionSpans);
