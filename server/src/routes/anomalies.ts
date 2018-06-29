import * as Router from 'koa-router';

import {
  Datasource,
  Metric,
  Anomaly,
  saveAnomaly,
  insertAnomaly, removeAnomaly, loadAnomalyByName, loadAnomalyById, getAnomalyIdByName
} from '../services/anomalyType';
import { runLearning } from '../services/analytics'
import { saveTargets } from '../services/metrics';

async function sendAnomalyTypeStatus(ctx: Router.IRouterContext) {
  let id = ctx.request.query.id;
  let name = ctx.request.query.name.toLowerCase();
  try {
    let anomaly: Anomaly;
    if(id !== undefined) {
      anomaly = loadAnomalyById(id);
    } else {
      anomaly = loadAnomalyByName(name);
    }
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

async function getAnomaly(ctx: Router.IRouterContext) {
  try {
    let id = ctx.request.query.id;
    let name = ctx.request.query.name.toLowerCase();

    let anomaly:Anomaly;
    if(id !== undefined) {
      anomaly = loadAnomalyById(id);
    } else {
      anomaly = loadAnomalyByName(name);
    }
    if(anomaly === null) {
      ctx.response.status = 404;
      return;
    }

    ctx.response.body = {
      name: anomaly.name,
      metric: anomaly.metric,
      status: anomaly.status
    };
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    ctx.response.status = 500;
    ctx.response.body = 'Can`t get anything';
  }
}

async function createAnomaly(ctx: Router.IRouterContext) {
  try {
    let body = ctx.request.body;
    const metric:Metric = {
      datasource: body.metric.datasource,
      targets: saveTargets(body.metric.targets)
    };

    const anomaly:Anomaly = {
      name: body.name.toLowerCase(),
      panelUrl: body.panelUrl,
      pattern: body.pattern.toLowerCase(),
      metric: metric,
      datasource: body.datasource,
      status: 'learning',
      last_prediction_time: 0,
      next_id: 0
    };
    let anomalyId = insertAnomaly(anomaly);
    if(anomalyId === null) {
      ctx.response.status = 403;
      ctx.response.body = {
        code: 403,
        message: 'Already exists'
      };
    }

    ctx.response.body = { anomaly_id: anomalyId };

    runLearning(anomalyId);
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
      removeAnomaly(id);
    } else {
      removeAnomaly(name);
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
router.get('/', getAnomaly);
router.post('/', createAnomaly);
router.delete('/', deleteAnomaly);
