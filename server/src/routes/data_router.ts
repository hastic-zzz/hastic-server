import * as AnalyticUnit from '../models/analytic_unit_model';
import { queryByMetric, GrafanaUnavailable, DatasourceUnavailable } from 'grafana-datasource-kit';
import { HASTIC_API_KEY, GRAFANA_URL } from '../config';

import * as Router from 'koa-router';


async function getData(ctx: Router.IRouterContext) {

  let from = ctx.request.query.from;
  let to = ctx.request.query.to;
  const panelId = ctx.request.query.panelId;

  if(panelId === undefined) {
    throw new Error(`data router error: request must contain panelId`);
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

  const analyticUnits = await AnalyticUnit.findMany({ panelId });

  if(analyticUnits.length < 1) {
    const message = `there aren't analytic units with panelId ${panelId} in data base, add at least one`;
    console.error(message);
    throw new Error(message);
  }

  const unit = analyticUnits[0];
  let grafanaUrl;
  if(GRAFANA_URL !== null) {
    grafanaUrl = GRAFANA_URL;
  } else {
    grafanaUrl = unit.grafanaUrl;
  }

  try {
    const data = await queryByMetric(unit.metric, grafanaUrl, from, to, HASTIC_API_KEY);
    ctx.response.body = { data };
  } catch(e) {
    console.error(`data router got exception ${e} while query data`);
    throw e;
  }  
}

export const router = new Router();

router.get('/', getData);
