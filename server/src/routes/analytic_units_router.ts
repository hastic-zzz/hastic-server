import * as Router from 'koa-router';

import * as AnalyticUnit from '../models/analytic_unit_model';

import { createAnalyticUnitFromObject } from '../controllers/analytics_controller'


async function sendStatus(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;
    if(id === undefined) {
      throw new Error('Id is undefined');
    }
    let unit = await AnalyticUnit.findById(id);
    if(unit.status === undefined) {
      throw new Error('status is undefined');
    }
    ctx.response.body = { status: unit.status, errorMessage: unit.error };
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = { error: 'Can`t return anything' };
  }

}

async function getUnit(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;

    if(id === undefined) {
      throw new Error('No id param in query');
    }

    let unit: AnalyticUnit.AnalyticUnit = await AnalyticUnit.findById(id);

    ctx.response.body = {
      name: unit.name,
      metric: unit.metric,
      status: unit.status
    };

  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = 'Can`t find anything';
  }
}

async function createUnit(ctx: Router.IRouterContext) {
  try {
    let newId = await createAnalyticUnitFromObject(ctx.request.body);
    ctx.response.body = { id: newId };
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Creation error: ${e.message}`
    };
  }
}

async function deleteUnit(ctx: Router.IRouterContext) {
  try {
    await AnalyticUnit.remove(ctx.request.query.id);
    ctx.response.body = {
      code: 200,
      message: 'Success'
    };
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Deletion error: ${e.message}`
    };
  }
}


export var router = new Router();

router.get('/', getUnit);
router.get('/status', sendStatus);
router.post('/', createUnit);
router.delete('/', deleteUnit);
