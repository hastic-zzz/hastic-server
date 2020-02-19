import { PanelTemplate, TemplateVariables } from '../models/panel_model';

import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';

import * as _ from 'lodash';


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
  const oldAnalyticUnitIds = panelTemplate.analyticUnits.map(analyticUnit => analyticUnit._id);

  panelTemplate.analyticUnits.forEach(analyticUnit => {
    analyticUnit._id = undefined;
    analyticUnit.grafanaUrl = variables.grafanaUrl;
    analyticUnit.panelId = variables.panelId;
    analyticUnit.metric.datasource.url = variables.datasourceUrl;
  });

  const newAnalyticUnitIds = await AnalyticUnit.insertMany(panelTemplate.analyticUnits);

  if(newAnalyticUnitIds.length !== oldAnalyticUnitIds.length) {
    throw new Error(`
      Something went wrong while inserting analytic units:
      inserted ${newAnalyticUnitIds.length} analytic units out of ${oldAnalyticUnitIds.length}
    `);
  }

  const oldToNewAnalyticUnitIdsMapping = new Map<AnalyticUnit.AnalyticUnitId, AnalyticUnit.AnalyticUnitId>(
    _.zip(oldAnalyticUnitIds, newAnalyticUnitIds)
  );

  const newCaches = panelTemplate.caches.map(
    cache => ({
      ...cache,
      id: oldToNewAnalyticUnitIdsMapping.get(cache.id)
    })
  );
  const newSegments = panelTemplate.segments.map(
    segment => ({
      ...segment,
      analyticUnitId: oldToNewAnalyticUnitIdsMapping.get(segment.analyticUnitId),
      id: undefined
    })
  );
  const newDetectionSpans = panelTemplate.detectionSpans.map(
    span => ({
      ...span,
      analyticUnitId: oldToNewAnalyticUnitIdsMapping.get(span.analyticUnitId)
    })
  );

  await Promise.all([
    AnalyticUnitCache.insertMany(newCaches),
    Segment.insertMany(newSegments),
    DetectionSpan.insertMany(newDetectionSpans)
  ]);
}
