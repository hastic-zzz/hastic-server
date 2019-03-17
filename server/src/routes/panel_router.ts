import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Panel from '../models/panel_model';

import * as Router from 'koa-router';


async function getAnalyticUnits(ctx: Router.IRouterContext) {
  let panelUrl: string = ctx.request.query.panelUrl;
  if(panelUrl === undefined || panelUrl === '') {
    throw new Error('panelUrl is missing');
  }
  const analyticUnits = await Panel.findOne({ panelUrl });
  ctx.response.body = { analyticUnits };
}

async function addAnalyticUnit(ctx: Router.IRouterContext) {
  let { panelUrl, analyticUnitId } = ctx.request.body as {
    panelUrl: string, analyticUnitId: AnalyticUnitId
  };
  await Panel.insertAnalyticUnit(panelUrl, analyticUnitId);
  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

async function deleteAnalyticUnit(ctx: Router.IRouterContext) {
  let { panelUrl, analyticUnitId } = ctx.request.body as {
    panelUrl: string, analyticUnitId: AnalyticUnitId
  };
  // TODO: stop task when analytic unit is removed
  await Panel.removeAnalyticUnit(panelUrl, analyticUnitId);
  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

export const router = new Router();

router.get('/', getAnalyticUnits);
router.post('/', addAnalyticUnit);
router.delete('/', deleteAnalyticUnit);
