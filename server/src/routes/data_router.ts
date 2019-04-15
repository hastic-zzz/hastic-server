import * as AnalyticUnit from '../models/analytic_unit_model';
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
  ctx.response.body = { data };
}

export const router = new Router();

router.get('/', query);
