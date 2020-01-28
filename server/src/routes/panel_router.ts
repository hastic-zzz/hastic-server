import { exportPanel } from '../services/export_service';

import * as Router from 'koa-router';

async function getPanelTemplate(ctx: Router.IRouterContext) {
  let panelId = ctx.request.query.panelId;
  if(panelId === undefined) {
    throw new Error('Cannot export analytic units with undefined panelId');
  }

  const json = await exportPanel(panelId);

  ctx.response.body = json;
}

export var router = new Router();

router.get('/template', getPanelTemplate);
