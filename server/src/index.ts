import { router as anomaliesRouter } from './routes/analytic_units_router';
import { router as segmentsRouter } from './routes/segments_router';


import * as AnalyticsController from './controllers/analytics_controller';

import * as ProcessService from './services/process_service';

import { HASTIC_PORT } from './config';

import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';


AnalyticsController.init();
ProcessService.registerExitHandler(AnalyticsController.terminate);

var app = new Koa();

app.on('error', (err, ctx) => {
  console.log('got server error:');
  console.log(err);
});


app.use(bodyParser())

app.use(async function(ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  await next();
});


var rootRouter = new Router();
rootRouter.use('/analyticUnits', anomaliesRouter.routes(), anomaliesRouter.allowedMethods());
rootRouter.use('/segments', segmentsRouter.routes(), segmentsRouter.allowedMethods());
//rootRouter.use('/alerts', alertsRouter.routes(), alertsRouter.allowedMethods());

var pjson = require('../../pacakge.json');
let packageVersion = process.env.npm_package_version ?
  process.env.npm_package_version : pjson.version;

rootRouter.get('/', async (ctx) => {
  ctx.response.body = {
    server: 'OK',
    analyticsReady: AnalyticsController.isAnalyticReady(),
    node_version: process.version,
    package_version: packageVersion,
    npm_user_agent: process.env.npm_config_user_agent,
    docker: process.env.INSIDE_DOCKER !== undefined,
    zmqConectionString: AnalyticsController.getZMQConnectionString(),
    serverPort: HASTIC_PORT
  };
});

app
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods());

app.listen(HASTIC_PORT, () => {
  console.log(`Server is running on :${HASTIC_PORT}`);
});

