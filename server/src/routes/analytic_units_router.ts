import * as AnalyticsController from '../controllers/analytics_controller';
import * as AnalyticUnit from '../models/analytic_unit_model';

import { createAnalyticUnitFromObject } from '../controllers/analytics_controller';

import * as Router from 'koa-router';


async function getStatus(ctx: Router.IRouterContext) {
  let analyticUnitId = ctx.request.query.id;
  if(analyticUnitId === undefined) {
    throw new Error('Cannot get status of undefined id');
  }

  let analyticUnit = await AnalyticUnit.findById(analyticUnitId);
  if(analyticUnit === null) {
    throw new Error(`Cannot find analytic unit with id ${analyticUnitId}`);
  }

  ctx.response.body = {
    status: analyticUnit.status
  };

  if(analyticUnit.status === AnalyticUnit.AnalyticUnitStatus.FAILED) {
    ctx.response.body.errorMessage = analyticUnit.error;
  }
}

async function getUnit(ctx: Router.IRouterContext) {
  let analyticUnitId = ctx.request.query.id;
  if(analyticUnitId === undefined) {
    throw new Error('No id param in query');
  }

  let analyticUnit = await AnalyticUnit.findById(analyticUnitId);
  if(analyticUnit === null) {
    throw new Error(`Cannot find analytic unit with id ${analyticUnitId}`);
  }

  ctx.response.body = {
    name: analyticUnit.name,
    metric: analyticUnit.metric,
    status: analyticUnit.status
  };  
}

async function getUnits(ctx: Router.IRouterContext) {
  const panelUrl = ctx.request.query.panelUrl;
  if(panelUrl === undefined) {
    throw new Error('Cannot get alerts of undefined panelUrl');
  }

  let analyticUnits = await AnalyticUnit.findMany({ panelUrl });
  if(analyticUnits === null) {
    analyticUnits = [];
  }

  ctx.response.body = { analyticUnits };
}

function getTypes(ctx: Router.IRouterContext) {
  ctx.response.body = AnalyticUnit.ANALYTIC_UNIT_TYPES;
}

async function createUnit(ctx: Router.IRouterContext) {
  let id = await createAnalyticUnitFromObject(ctx.request.body);
  ctx.response.body = { id };
}

async function updateUnit(ctx: Router.IRouterContext) {
  const unit = ctx.request.body as AnalyticUnit.AnalyticUnit;
  if(unit.id === undefined) {
    throw new Error('Cannot update undefined id');
  }

  // TODO: we can't allow to update everything
  AnalyticUnit.update(unit.id, unit);
  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

async function updateMetric(ctx: Router.IRouterContext) {
  const { analyticUnitId, metric, datasource } = ctx.request.body as {
    analyticUnitId: AnalyticUnit.AnalyticUnitId, metric: any, datasource: any
  };
  if(analyticUnitId === undefined) {
    throw new Error('Cannot update undefined id');
  }
  if(metric === undefined) {
    throw new Error('Cannot set undefined metric');
  }
  if(datasource === undefined) {
    throw new Error('Cannot set undefined datasource');
  }

  await AnalyticsController.setMetric(analyticUnitId, metric, datasource);

  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

async function updateAlert(ctx: Router.IRouterContext) {
  const { analyticUnitId, alert } = ctx.request.body as {
    analyticUnitId: AnalyticUnit.AnalyticUnitId, alert: boolean
  };
  if(analyticUnitId === undefined) {
    throw new Error('Cannot update undefined id');
  }
  if(alert === undefined) {
    throw new Error('Cannot set undefined alert status');
  }

  await AnalyticsController.setAlert(analyticUnitId, alert);

  ctx.response.body = {
    code: 200,
    message: 'Success'
  };

}

async function deleteUnit(ctx: Router.IRouterContext) {
  const analyticUnitId = ctx.request.query.id;
  if(analyticUnitId === undefined) {
    throw new Error('Cannot delete undefined id');
  }
  await AnalyticsController.remove(analyticUnitId);
  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

async function runDetect(ctx: Router.IRouterContext) {
  const { id: analyticUnitId } = ctx.request.body as { id: AnalyticUnit.AnalyticUnitId };
  AnalyticsController.runFirstLearning(analyticUnitId);
  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}


export var router = new Router();

router.get('/', getUnit);
router.get('/units', getUnits);
router.get('/status', getStatus);
router.get('/types', getTypes);
router.patch('/metric', updateMetric);
router.patch('/alert', updateAlert);

router.post('/', createUnit);
router.delete('/', deleteUnit);
router.patch('/', updateUnit);

router.post('/detect', runDetect);
