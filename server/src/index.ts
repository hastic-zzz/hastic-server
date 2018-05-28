import * as Koa from 'koa';
import * as Router from 'koa-router';


import { router as anomaliesRouter } from './routes/anomalies';
import { router as segmentsRouter } from './routes/segments';
import { router as alertsRouter } from './routes/alerts';

import { checkDataFolders } from './services/data';

checkDataFolders();

var app = new Koa();
const PORT = process.env.HASTIC_PORT || 8000;

app.use(async function(ctx) {
  ctx.header('Access-Control-Allow-Origin', '*');
  ctx.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  ctx.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
});

var anRouter = new Router();
anRouter.use('/anomalies', anomaliesRouter.routes(), anomaliesRouter.allowedMethods());

var seRouter = new Router();
anRouter.use('/segments', segmentsRouter.routes(), segmentsRouter.allowedMethods());

var seRouter = new Router();
anRouter.use('/alerts', alertsRouter.routes(), alertsRouter.allowedMethods());

var rootRoute = new Router();
rootRoute.get('/', async (ctx) => {
  ctx.body = { status: 'OK' };
});

app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`)
});
