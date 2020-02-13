import { PanelTemplate, TemplateVariables } from '../models/panel_model';

import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';


export async function exportPanel(panelId: string): Promise<PanelTemplate> {
  const analyticUnits = await AnalyticUnit.findMany({ panelId });
  const analyticUnitIds = analyticUnits.map(analyticUnit => analyticUnit.id);
  const analyticUnitTemplates = analyticUnits.map(analyticUnit => analyticUnit.toTemplate());

  const [caches, detectionSpans, segments] = await Promise.all([
    AnalyticUnitCache.findMany({ _id: { $in: analyticUnitIds } }),
    DetectionSpan.findByAnalyticUnitIds(analyticUnitIds),
    Segment.findByAnalyticUnitIds(analyticUnitIds)
  ]);

  return {
    analyticUnits: analyticUnitTemplates,
    caches,
    detectionSpans,
    segments
  };
}

export async function importPanel(
  panelTemplate: PanelTemplate,
  variables: TemplateVariables
): Promise<void> {
  panelTemplate.analyticUnits.forEach(analyticUnit => {
    analyticUnit.grafanaUrl = variables.grafanaUrl;
    analyticUnit.panelId = variables.panelId;
    analyticUnit.metric.datasource.url = variables.datasourceUrl;
  });
  await AnalyticUnit.insertMany(panelTemplate.analyticUnits);
  await AnalyticUnitCache.insertMany(panelTemplate.caches);
  await Segment.insertMany(panelTemplate.segments);
  await DetectionSpan.insertMany(panelTemplate.detectionSpans);
}
