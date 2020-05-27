import { router as analyticUnitsRouter } from './routes/analytic_units_router';
import { router as segmentsRouter } from './routes/segments_router';
import { router as dataRouter } from './routes/data_router';
import { router as detectionsRouter } from './routes/detections_router';
import { router as panelRouter } from './routes/panel_router';

import * as AnalyticsController from './controllers/analytics_controller';

import * as ProcessService from './services/process_service';

import { HASTIC_PORT, PACKAGE_VERSION, GIT_INFO, HASTIC_INSTANCE_NAME } from './config';

import { applyDBMigrations } from './services/data_service/migrations';

import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';

import { createServer } from 'http';

init();

async function init() {
  await applyDBMigrations();

  const app = new Koa();
  let httpServer = createServer(app.callback());

  AnalyticsController.init();
  ProcessService.registerExitHandler(AnalyticsController.terminate);

  app.on('error', (err, ctx) => {
    console.log('got server error:');
    console.log(err);
  });

  app.use(bodyParser());

  app.use(async function(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    await next();
  });
  app.use(async function(ctx, next) {
    try {
      await next();
    } catch (e) {
      console.error(e);
      ctx.response.status = 500;
      ctx.response.body = {
        code: 500,
        message: `${ctx.method} ${ctx.url} error: ${e.message}`
      };
    }
  });


  const rootRouter = new Router();
  rootRouter.use('/analyticUnits', analyticUnitsRouter.routes(), analyticUnitsRouter.allowedMethods());
  rootRouter.use('/segments', segmentsRouter.routes(), segmentsRouter.allowedMethods());
  rootRouter.use('/query', dataRouter.routes(), dataRouter.allowedMethods());
  rootRouter.use('/detections', detectionsRouter.routes(), detectionsRouter.allowedMethods());
  rootRouter.use('/panels', panelRouter.routes(), panelRouter.allowedMethods());

  rootRouter.get('/', async (ctx) => {
    const activeWebhooks = await AnalyticsController.getActiveWebhooks();

    ctx.response.body = {
      server: 'OK',
      analytics: {
        ready: AnalyticsController.isAnalyticReady(),
        lastAlive: AnalyticsController.analyticsLastAlive(),
        tasksQueueLength: AnalyticsController.getQueueLength()
      },
      instanceName: HASTIC_INSTANCE_NAME,
      awaitedTasksNumber: AnalyticsController.getTaskResolversLength(),
      detectionsCount: AnalyticsController.getDetectionsCount(),
      nodeVersion: process.version,
      packageVersion: PACKAGE_VERSION,
      npmUserAgent: process.env.npm_config_user_agent,
      docker: process.env.INSIDE_DOCKER !== undefined,
      serverPort: HASTIC_PORT,
      git: GIT_INFO,
      activeWebhooks: activeWebhooks.length,
      timestamp: new Date(Date.now())
    };
  });

  app
    .use(rootRouter.routes())
    .use(rootRouter.allowedMethods());

  httpServer.listen({ port: HASTIC_PORT, exclusive: true }, () => {
    console.log(`Server is running on :${HASTIC_PORT}`);
  });

  httpServer.on('error', (err) => {
    console.error(`Http server error: ${err.message}`)
  });

  ProcessService.registerExitHandler(() => {
    httpServer.close();
  });

}
