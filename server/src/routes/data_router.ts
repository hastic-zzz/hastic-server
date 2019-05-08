import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import * as AnalyticsController from '../controllers/analytics_controller';
import { HASTIC_API_KEY } from '../config';
import { getGrafanaUrl } from '../utils/grafana';

import { queryByMetric } from 'grafana-datasource-kit';

import * as Router from 'koa-router';


async function query(ctx: Router.IRouterContext) {

  let from = ctx.request.query.from;
  let to = ctx.request.query.to;
  const analyticUnitId = ctx.request.query.analyticUnitId;

  if(analyticUnitId === undefined) {
    throw new Error(`data router error: request must contain analyticUnitId`);
  }

  if(from === undefined) {
    throw new Error(`data router error: request must contain 'from'`)
  }

  if(to === undefined) {
    throw new Error(`data router error: request must contain 'to'`)
  }

  from = +from;
  to = +to;

  if(from === NaN) {
    throw new Error(`from must be not NaN`);
  }

  if(to === NaN) {
    throw new Error(`to must be not NaN`);
  }

  if(to <= from) {
    throw new Error(`data router error: 'to' must be greater than 'from' (from:${from} to:${to})`);
  }

  const analyticUnit = await AnalyticUnit.findById(analyticUnitId);

  if(analyticUnit === undefined) {
    throw new Error(`can't find analytic unit ${analyticUnitId}`);
  }

  const grafanaUrl = getGrafanaUrl(analyticUnit.grafanaUrl);
  const data = await queryByMetric(analyticUnit.metric, grafanaUrl, from, to, HASTIC_API_KEY);

  if(analyticUnit.detectorType !== AnalyticUnit.DetectorType.ANOMALY) {
    ctx.response.body = { results: data };
    return;
  }

  let cache = await AnalyticUnitCache.findById(analyticUnitId);
  if(cache !== null) {
    throw Error(`${analyticUnitId} got empty cache for processing`)
  }
  const analyticUnitType = analyticUnit.type;
  const detector = analyticUnit.detectorType;
  const payload = {
    data,
    analyticUnitType,
    detector,
    cache
  }

  const processingTask = new AnalyticsTask(analyticUnitId, AnalyticsTaskType.PROCESS, payload);
  let result = await AnalyticsController.runTask(processingTask);
  if(result.status !== AnalyticUnit.AnalyticUnitStatus.SUCCESS) {
    throw new Error(result.error);
  }
  ctx.response.body = { results: result.data };
}

export const router = new Router();

router.get('/', query);
