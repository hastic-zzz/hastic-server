// /**
//  * Alarting is not supported yet
//  */

// throw new console.error("Not supported");


// import * as AnalyticUnit from '../models/analytic_unit';
// import { getAlertsAnomalies, saveAlertsAnomalies } from '../controllers/alerts_controller';

// import * as Router from 'koa-router';


// function getAlert(ctx: Router.IRouterContext) {
//   let id: AnalyticUnit.AnalyticUnitId = ctx.request.query.id;

//   let alertsAnomalies = getAlertsAnomalies();
//   let pos = alertsAnomalies.indexOf(id);

//   let enabled: boolean = (pos !== -1);
//   ctx.response.body = { enabled };
// }

// function setAlertEnabled(ctx: Router.IRouterContext) {
//   let id: AnalyticUnit.AnalyticUnitId = ctx.request.body.id;
//   let enabled: boolean = ctx.request.body.enabled;

//   let alertsAnomalies = getAlertsAnomalies();
//   let pos: number = alertsAnomalies.indexOf(id);
//   if(enabled && pos == -1) {
//     alertsAnomalies.push(id);
//     saveAlertsAnomalies(alertsAnomalies);
//   } else if(!enabled && pos > -1) {
//     alertsAnomalies.splice(pos, 1);
//     saveAlertsAnomalies(alertsAnomalies);
//   }
//   ctx.response.body = { status: 'OK' };
// }

// export const router = new Router();

// router.get('/', getAlert);
// router.post('/', setAlertEnabled);
