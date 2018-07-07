import { router as anomaliesRouter } from './routes/analytic_units_router';
import { router as segmentsRouter } from './routes/segments_router';
import { router as alertsRouter } from './routes/alerts_router';

import * as Data from './services/data_service';

import { HASTIC_PORT } from './config';

import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

Data.checkDataFolders();

var app = new Koa();

app.use(bodyParser())

app.use(async function(ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


var rootRouter = new Router();
rootRouter.use('/analyticUnits', anomaliesRouter.routes(), anomaliesRouter.allowedMethods());
rootRouter.use('/segments', segmentsRouter.routes(), segmentsRouter.allowedMethods());
rootRouter.use('/alerts', alertsRouter.routes(), alertsRouter.allowedMethods());
rootRouter.get('/', async (ctx) => {
  ctx.response.body = { status: 'Ok' };
});

app
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods());

app.listen(HASTIC_PORT, () => {
  console.log(`Server is running on :${HASTIC_PORT}`);
});

