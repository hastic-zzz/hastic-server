import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';


import { router as anomaliesRouter } from './routes/anomalies';
import { router as segmentsRouter } from './routes/segments';
import { router as alertsRouter } from './routes/alerts';

import { checkDataFolders } from './services/data';

checkDataFolders();

var app = new Koa();
const PORT = process.env.HASTIC_PORT || 8000;

app.use(bodyParser())

app.use(async function(ctx, next) {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

var rootRouter = new Router();
rootRouter.use('/anomalies', anomaliesRouter.routes(), anomaliesRouter.allowedMethods());
rootRouter.use('/segments', segmentsRouter.routes(), segmentsRouter.allowedMethods());
rootRouter.use('/alerts', alertsRouter.routes(), alertsRouter.allowedMethods());
rootRouter.get('/', async (ctx) => {
  ctx.response.body = { status: 'OK' };
});

app
  .use(rootRouter.routes())
  .use(rootRouter.allowedMethods())

app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`)
});
