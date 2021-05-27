import { GrafanaPanelTemplate, GrafanaTemplateVariables } from '../models/grafana_panel_model';
import { exportPanel, importPanel } from '../services/grafana_service';

import * as Router from 'koa-router';


async function exportGrafanaPanelTemplate(ctx: Router.IRouterContext) {
  const panelId = ctx.request.query.panelId as string;
  if(panelId === undefined) {
    throw new Error('Cannot export analytic units with undefined panelId');
  }

  const panelTemplate = await exportPanel(panelId);
  ctx.response.body = panelTemplate;
}

async function importGrafanaPanelTemplate(ctx: Router.IRouterContext) {
  const { panelTemplate, templateVariables } = ctx.request.body as {
    panelTemplate: GrafanaPanelTemplate,
    templateVariables: GrafanaTemplateVariables
  };

  if(panelTemplate.analyticUnitTemplates === undefined) {
    throw new Error('Cannot import analytic units with undefined analyticUnitTemplates');
  }
  await importPanel(panelTemplate, templateVariables);
  ctx.response.status = 200;
}

export var router = new Router();

router.get('/template', exportGrafanaPanelTemplate);
router.post('/template', importGrafanaPanelTemplate);
