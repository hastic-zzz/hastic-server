import * as AnalyticsController from '../controllers/analytics_controller';
import * as AnalyticUnit from '../models/analytic_units';

import { saveAnalyticUnitFromObject } from '../controllers/analytics_controller';

import { getClassByDetectorType } from '../models/analytic_units/utils';

import * as Router from 'koa-router';
import * as _ from 'lodash';


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

async function getUnits(ctx: Router.IRouterContext) {
  const panelId = ctx.request.query.panelId;
  if(panelId === undefined) {
    throw new Error('Cannot get units of undefined panelId');
  }

  let analyticUnits = await AnalyticUnit.findMany({ panelId });
  if(analyticUnits === null) {
    analyticUnits = [];
  }

  const analyticUnitObjects = analyticUnits.map(analyticUnit => analyticUnit.toPanelObject());

  ctx.response.body = {
    analyticUnits: analyticUnitObjects
  };
}

function getTypes(ctx: Router.IRouterContext) {
  ctx.response.body = AnalyticUnit.ANALYTIC_UNIT_TYPES;
}

async function createUnit(ctx: Router.IRouterContext) {
  const id = await saveAnalyticUnitFromObject(ctx.request.body);

  ctx.response.body = { id };
}

async function updateUnit(ctx: Router.IRouterContext) {
  const analyticUnitObj = ctx.request.body as AnalyticUnit.AnalyticUnit;
  if(analyticUnitObj.id === undefined) {
    throw new Error('Cannot update undefined id');
  }

  await AnalyticUnit.update(analyticUnitObj.id, analyticUnitObj);

  if(getClassByDetectorType(analyticUnitObj.detectorType).learningAfterUpdateRequired) {
    await AnalyticsController.runLearning(analyticUnitObj.id);
  }

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
  const { ids, from, to } = ctx.request.body as {
    ids: AnalyticUnit.AnalyticUnitId[], from: number, to: number
  };

  await Promise.all(ids.map(id => AnalyticsController.runLearningWithDetection(id, from, to)));

  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}


export var router = new Router();

router.get('/units', getUnits);
router.get('/status', getStatus);
router.get('/types', getTypes);
router.patch('/metric', updateMetric);
router.patch('/alert', updateAlert);

router.post('/', createUnit);
router.delete('/', deleteUnit);
router.patch('/', updateUnit);

router.post('/detect', runDetect);
