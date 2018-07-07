import * as Router from 'koa-router';

import * as AnalyticUnit from '../models/analytic_unit';

import { runLearning } from '../controllers/analytics_controller'
import { saveTargets } from '../controllers/metrics_controler';

async function sendStatus(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;
    let name = ctx.request.query.name;

    if(id === undefined) {
      throw new Error('Id is undefined');
    }
    let unit = AnalyticUnit.findById(id);

    if(unit.status === undefined) {
      throw new Error('No status for ' + name);
    }
    ctx.response.body = { status: unit.status, errorMessage: unit.error };
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = { error: 'Can`t return anything' };
  }

}

async function findItem(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;

    if(id === undefined) {
      throw new Error('No id param in query');
    }

    let unit: AnalyticUnit.AnalyticUnit = AnalyticUnit.findById(id);

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

async function createItem(ctx: Router.IRouterContext) {
  try {

    let body = ctx.request.body;

    if(body.type === undefined) {
      throw new Error(`Missing field: type`);
    }
    if(body.name === undefined) {
      throw new Error(`Missing field: name`);
    }
    if(body.panelUrl === undefined) {
      throw new Error(`Missing field: panelUrl`);
    }
    if(body.metric === undefined) {
      throw new Error(`Missing field: datasource`);
    }
    if(body.metric.datasource === undefined) {
      throw new Error(`Missing field: metric.datasource`);
    }
    if(body.metric.targets === undefined) {
      throw new Error(`Missing field: metric.targets`);
    }

    const metric: AnalyticUnit.Metric = {
      datasource: body.metric.datasource,
      targets: saveTargets(body.metric.targets)
    };

    const unit: AnalyticUnit.AnalyticUnit = {
      name: body.name,
      panelUrl: body.panelUrl,
      type: body.type,
      datasource: body.datasource,
      metric: metric,
      status: 'learning',
      lastPredictionTime: 0,
      nextId: 0
    };

    let newId = AnalyticUnit.createItem(unit);
    if(newId === null) {
      ctx.response.status = 403;
      ctx.response.body = {
        code: 403,
        message: 'Item exists'
      };
    }

    ctx.response.body = { id: newId };

    runLearning(newId);
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Creation error: ${e.message}`
    };
  }
}

function deleteItem(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;

    if(id !== undefined) {
      AnalyticUnit.remove(id);
    }

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

router.get('/status', sendStatus);
router.get('/', findItem);
router.post('/', createItem);
router.delete('/', deleteItem);
