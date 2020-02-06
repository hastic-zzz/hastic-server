import { PanelTemplate } from '../models/panel_model';
import { exportPanel, importPanel } from '../services/export_service';

import * as Router from 'koa-router';


async function exportPanelTemplate(ctx: Router.IRouterContext) {
  let panelId = ctx.request.query.panelId;
  if(panelId === undefined) {
    throw new Error('Cannot export analytic units with undefined panelId');
  }

  const panelTemplate = await exportPanel(panelId);
  ctx.response.body = panelTemplate;
} 

async function importPanelTemplate(ctx: Router.IRouterContext) {
  const panelTemplate = ctx.request.body as PanelTemplate;

  // TODO: move to model
  if(panelTemplate.analyticUnitTemplates === undefined) {
    throw new Error('Cannot import analytic units with undefined analyticUnitTemplates');
  }
  if(panelTemplate.caches === undefined) {
    throw new Error('Cannot import analytic units with undefined caches');
  }
  if(panelTemplate.detectionSpans === undefined) {
    throw new Error('Cannot import analytic units with undefined detectionSpans');
  }
  if(panelTemplate.segments === undefined) {
    throw new Error('Cannot import analytic units with undefined segments');
  }

  await importPanel(panelTemplate);
  ctx.response.status = 200;
}

export var router = new Router();

router.get('/template', exportPanelTemplate);
router.post('/template', importPanelTemplate);
