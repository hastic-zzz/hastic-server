import { AnomalyId, getAnomalyIdByName, loadAnomalyById } from '../services/anomalyType';
import { getAlertsAnomalies, saveAlertsAnomalies } from '../services/alerts';

import * as Router from 'koa-router';


function getAlert(ctx: Router.IRouterContext) {
  
  let anomalyId: AnomalyId = ctx.request.query.anomaly_id;
  let anomaly = loadAnomalyById(anomalyId)
  if(anomaly == null) {
    anomalyId = getAnomalyIdByName(anomalyId.toLowerCase());
  }

  let alertsAnomalies = getAlertsAnomalies();
  let pos = alertsAnomalies.indexOf(anomalyId);

  let enable: boolean = (pos !== -1);
  ctx.response.body = { enable };
  
}

function changeAlert(ctx: Router.IRouterContext) {

  let anomalyId: AnomalyId = ctx.request.body.anomaly_id;
  let enable: boolean = ctx.request.body.enable;

  let anomaly = loadAnomalyById(anomalyId)
  if(anomaly == null) {
    anomalyId = getAnomalyIdByName(anomalyId.toLowerCase());
  }

  let alertsAnomalies = getAlertsAnomalies();
  let pos: number = alertsAnomalies.indexOf(anomalyId);
  if(enable && pos == -1) {
    alertsAnomalies.push(anomalyId);
    saveAlertsAnomalies(alertsAnomalies);
  } else if(!enable && pos > -1) {
    alertsAnomalies.splice(pos, 1);
    saveAlertsAnomalies(alertsAnomalies);
  }
  ctx.response.body = { status: 'OK' };

}

export const router = new Router();

router.get('/', getAlert);
router.post('/', changeAlert);

