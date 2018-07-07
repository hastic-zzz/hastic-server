import * as Router from 'koa-router';

import {
  Datasource,
  Metric,
  AnalyticUnit,

  insertAnomaly, removeItem, loadPredictorById
} from '../models/analytic_unit';
import { runLearning } from '../services/analytics'
import { saveTargets } from '../services/metrics';

async function sendAnomalyTypeStatus(ctx: Router.IRouterContext) {
  let id = ctx.request.query.id;
  let name = ctx.request.query.name.toLowerCase();
  try {
    let anomaly: AnalyticUnit;
    if(id === undefined) {
      throw new Error('Id is undefined');
    }
    anomaly = loadPredictorById(id);

    if(anomaly === null) {
      ctx.response.status = 404;
      return;
    }
    if(anomaly.status === undefined) {
      throw new Error('No status for ' + name);
    }
    ctx.response.body = { status: anomaly.status, errorMessage: anomaly.error };
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = { error: 'Can`t return anything' };
  }

}

async function getAnalyticUnit(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;
    let name = ctx.request.query.name.toLowerCase();

    if(id === undefined) {
      throw new Error('No id param in query');
    }

    if(name === undefined) {
      throw new Error('No name param in query');
    }

    let unit: AnalyticUnit = loadPredictorById(id);

    if(unit === null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = {
      name: unit.name,
      metric: unit.metric,
      status: unit.status
    };

  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = 'Can`t get anything';
  }
}

async function createAnalyticUnit(ctx: Router.IRouterContext) {
  try {
    let body = ctx.request.body;
    const metric:Metric = {
      datasource: body.metric.datasource,
      targets: saveTargets(body.metric.targets)
    };

    const anomaly:AnalyticUnit = {
      name: body.name.toLowerCase(),
      panelUrl: body.panelUrl,
      pattern: body.pattern.toLowerCase(),
      metric: metric,
      datasource: body.datasource,
      status: 'learning',
      lastPredictionTime: 0,
      nextId: 0
    };
    let predictorId = insertAnomaly(anomaly);
    if(predictorId === null) {
      ctx.response.status = 403;
      ctx.response.body = {
        code: 403,
        message: 'Already exists'
      };
    }

    ctx.response.body = { predictor_id: predictorId };

    runLearning(predictorId);
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Anomaly creation error: ${e.message}`
    };
  }
}

function deleteAnomaly(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;
    let name = ctx.request.query.name.toLowerCase();

    if(id !== undefined) {
      removeItem(id);
    } else {
      removeItem(name);
    }

    ctx.response.body = {
      code: 200,
      message: 'Success'
    };
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Anomaly deletion error: ${e.message}`
    };
  }
}


export var router = new Router();

router.get('/status', sendAnomalyTypeStatus);
router.get('/', getAnalyticUnit);
router.post('/', createAnalyticUnit);
router.delete('/', deleteAnomaly);
