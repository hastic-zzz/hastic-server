import { GrafanaPanelTemplate, GrafanaTemplateVariables } from '../models/grafana_panel_model';
import { exportPanel, importPanel } from '../services/grafana_service';

import * as Router from 'koa-router';


async function exportGrafanaPanelTemplate(ctx: Router.IRouterContext) {
  let panelId = ctx.request.query.panelId;
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

  // TODO: move to model
  if(panelTemplate.analyticUnits === undefined) {
    throw new Error('Cannot import analytic units with undefined analyticUnits');
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

  if(templateVariables.grafanaUrl === undefined) {
    throw new Error('Cannot make analytic unit from template with undefined grafanaUrl');
  }
  if(templateVariables.panelId === undefined) {
    throw new Error('Cannot make analytic unit from template with undefined panelId');
  }
  if(templateVariables.datasourceUrl === undefined) {
    throw new Error('Cannot make analytic unit from template with undefined datasourceUrl');
  }

  await importPanel(panelTemplate, templateVariables);
  ctx.response.status = 200;
}

export var router = new Router();

router.get('/template', exportGrafanaPanelTemplate);
router.post('/template', importGrafanaPanelTemplate);
