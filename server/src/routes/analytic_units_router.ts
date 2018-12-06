import * as AnalyticsController from '../controllers/analytics_controller';
import * as AnalyticUnit from '../models/analytic_unit_model';

import { createAnalyticUnitFromObject } from '../controllers/analytics_controller';

import * as Router from 'koa-router';


async function getStatus(ctx: Router.IRouterContext) {
  try {
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
  } catch(e) {
    console.error(e);
    ctx.response.status = 404;
    ctx.response.body = {
      code: 404,
      message: `GET /analyticUnits/status error: ${e.message}`
    };
  }
}

async function getUnit(ctx: Router.IRouterContext) {
  try {
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

  } catch(e) {
    console.error(e);
    ctx.response.status = 404;
    ctx.response.body = {
      code: 404,
      message: `GET /analyticUnits error: ${e.message}`
    };
  }
}

async function getUnits(ctx: Router.IRouterContext) {
  try {
    const panelUrl = ctx.request.query.panelUrl;
    if(panelUrl === undefined) {
      throw new Error('Cannot get alerts of undefined panelUrl');
    }

    let analyticUnits = await AnalyticUnit.findMany({ panelUrl });
    if(analyticUnits === null) {
      analyticUnits = [];
    }

    ctx.response.body = {
      analyticUnits
    };
  } catch(e) {
    console.error(e);
    ctx.response.status = 404;
    ctx.response.body = {
      code: 404,
      message: `GET /analyticUnits/units error: ${e.message}`
    };
  }
}

async function createUnit(ctx: Router.IRouterContext) {
  try {
    let id = await createAnalyticUnitFromObject(ctx.request.body);
    ctx.response.body = { id };
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `POST /analyticUnits error: ${e.message}`
    };
  }
}

async function setAlert(ctx: Router.IRouterContext) {
  try {
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
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `PATCH /analyticUnits/alert error: ${e.message}`
    };
  }
}

async function deleteUnit(ctx: Router.IRouterContext) {
  try {
    const analyticUnitId = ctx.request.query.id;
    if(analyticUnitId === undefined) {
      throw new Error('Cannot delete undefined id');
    }
    await AnalyticsController.remove(analyticUnitId);
    ctx.response.body = {
      code: 200,
      message: 'Success'
    };
  } catch(e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `DELETE /analyticUnits error: ${e.message}`
    };
  }
}


export var router = new Router();

router.get('/', getUnit);
router.get('/units', getUnits);
router.get('/status', getStatus);
router.patch('/alert', setAlert);
router.post('/', createUnit);
router.delete('/', deleteUnit);
