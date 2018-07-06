import { PredictorId, getPredictorIdByName, loadAnomalyById } from '../services/anomalyType';
import { getAlertsAnomalies, saveAlertsAnomalies } from '../services/alerts';

import * as Router from 'koa-router';


function getAlert(ctx: Router.IRouterContext) {
  
  let predictorId: PredictorId = ctx.request.query.predictor_id.toLowerCase();
  let anomaly = loadAnomalyById(predictorId)
  if(anomaly == null) {
    predictorId = getPredictorIdByName(predictorId);
  }

  let alertsAnomalies = getAlertsAnomalies();
  let pos = alertsAnomalies.indexOf(predictorId);

  let enable: boolean = (pos !== -1);
  ctx.response.body = { enable };
  
}

function changeAlert(ctx: Router.IRouterContext) {

  let predictorId: PredictorId = ctx.request.body.predictor_id.toLowerCase();
  let enable: boolean = ctx.request.body.enable;

  let anomaly = loadAnomalyById(predictorId)
  if(anomaly == null) {
    predictorId = getPredictorIdByName(predictorId);
  }

  let alertsAnomalies = getAlertsAnomalies();
  let pos: number = alertsAnomalies.indexOf(predictorId);
  if(enable && pos == -1) {
    alertsAnomalies.push(predictorId);
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

