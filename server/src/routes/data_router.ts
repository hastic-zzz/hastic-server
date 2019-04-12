import * as AnalyticUnit from '../models/analytic_unit_model';
import { queryByMetric, GrafanaUnavailable, DatasourceUnavailable } from 'grafana-datasource-kit';
import { HASTIC_API_KEY, GRAFANA_URL } from '../config';

import * as Router from 'koa-router';


async function getData(ctx: Router.IRouterContext) {

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

  if(to <= from) {
    const message = `data router error: 'to' must be greater than 'from' (from:${from} to:${to})`;
    console.error(message);
    throw new Error(message);
  }

  const analyticUnit = await AnalyticUnit.findById(analyticUnitId);

  if(analyticUnit === undefined) {
    const message = `analytic unit with id ${analyticUnitId} not present in data base`;
    console.error(message);
    throw new Error(message);
  }

  let grafanaUrl;
  if(GRAFANA_URL !== null) {
    grafanaUrl = GRAFANA_URL;
  } else {
    grafanaUrl = analyticUnit.grafanaUrl;
  }

  try {
    const data = await queryByMetric(analyticUnit.metric, grafanaUrl, from, to, HASTIC_API_KEY);
    ctx.response.body = { data };
  } catch(e) {
    console.error(`data router got exception ${e} while query data`);
    throw e;
  }  
}

export const router = new Router();

router.get('/', getData);
