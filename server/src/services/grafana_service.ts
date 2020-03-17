import { GrafanaPanelTemplate, GrafanaTemplateVariables } from '../models/grafana_panel_model';

import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';

import * as _ from 'lodash';


export async function exportPanel(panelId: string): Promise<GrafanaPanelTemplate> {
  const analyticUnits = await AnalyticUnit.findMany({ panelId });
  const analyticUnitIds = analyticUnits.map(analyticUnit => analyticUnit.id);

  const [caches, detectionSpans, segments] = await Promise.all([
    AnalyticUnitCache.findMany({ _id: { $in: analyticUnitIds } }),
    DetectionSpan.findByAnalyticUnitIds(analyticUnitIds),
    Segment.findByAnalyticUnitIds(analyticUnitIds)
  ]);

  // TODO: not any
  let analyticUnitTemplates: any[] = [];

  analyticUnits.forEach(analyticUnit => {
    const analyticUnitTemplate = analyticUnit.toTemplate();

    let analyticUnitCache = _.find(caches, cache => cache.id === analyticUnit.id) || null;
    if(analyticUnitCache !== null) {
      analyticUnitCache = analyticUnitCache.toTemplate();
    }

    const analyticUnitSegments = segments
      .filter(segment => segment.analyticUnitId === analyticUnit.id)
      .map(segment => segment.toTemplate());

    const analyticUnitSpans = detectionSpans
      .filter(span => span.analyticUnitId === analyticUnit.id)
      .map(span => span.toTemplate());

    analyticUnitTemplates.push({
      ...analyticUnitTemplate,
      cache: analyticUnitCache,
      segments: analyticUnitSegments,
      detectionSpans: analyticUnitSpans
    });
  });

  return { analyticUnitTemplates };
}

export async function importPanel(
  panelTemplate: GrafanaPanelTemplate,
  variables: GrafanaTemplateVariables
): Promise<void> {
  await Promise.all(panelTemplate.analyticUnitTemplates.map(
    template => _importAnalyticUnitTemplate(template, variables)
  ));
}

export async function _importAnalyticUnitTemplate(analyticUnitTemplate: any, variables: GrafanaTemplateVariables) {
  analyticUnitTemplate.grafanaUrl = variables.grafanaUrl;
  analyticUnitTemplate.panelId = variables.panelId;
  analyticUnitTemplate.metric.datasource.url = variables.datasourceUrl;

  const cache = _.clone(analyticUnitTemplate.cache);
  const segments = _.clone(analyticUnitTemplate.segments);
  const detectionSpans = _.clone(analyticUnitTemplate.detectionSpans);

  delete analyticUnitTemplate.cache;
  delete analyticUnitTemplate.segments;
  delete analyticUnitTemplate.detectionSpans;

  const [ newAnalyticUnitId ] = await AnalyticUnit.insertMany([analyticUnitTemplate]);

  if(cache !== null) {
    cache._id = newAnalyticUnitId;
  }

  segments.forEach(segment => segment.analyticUnitId = newAnalyticUnitId);
  detectionSpans.forEach(detectionSpan => detectionSpan.analyticUnitId = newAnalyticUnitId);

  return Promise.all([
    AnalyticUnitCache.insertMany([cache]),
    Segment.insertMany(segments),
    DetectionSpan.insertMany(detectionSpans)
  ]);
}
