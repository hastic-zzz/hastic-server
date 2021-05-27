import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticsController from '../controllers/analytics_controller';

import * as Router from 'koa-router';


async function query(ctx: Router.IRouterContext) {

  let queryFrom = ctx.request.query.from as string;
  let queryTo = ctx.request.query.to as string;
  const analyticUnitId = ctx.request.query.analyticUnitId as string;

  if(analyticUnitId === undefined) {
    throw new Error(`data router error: request must contain analyticUnitId`);
  }

  if(queryFrom === undefined) {
    throw new Error(`data router error: request must contain 'from'`)
  }

  if(queryTo === undefined) {
    throw new Error(`data router error: request must contain 'to'`)
  }

  const from = +queryFrom;
  const to = +queryTo;

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

  if(analyticUnit === null) {
    throw new Error(`can't find analytic unit ${analyticUnitId}`);
  }

  const results = await AnalyticsController.getHSR(analyticUnit, from, to);
  ctx.response.body = { results };
}

export const router = new Router();

router.get('/', query);
