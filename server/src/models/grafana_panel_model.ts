import * as AnalyticUnit from './analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';

export type GrafanaPanelTemplate = {
  analyticUnits: any[],
  caches: AnalyticUnitCache.AnalyticUnitCache[],
  detectionSpans: DetectionSpan.DetectionSpan[],
  segments: Segment.Segment[]
}

export type GrafanaTemplateVariables = {
  grafanaUrl: string,
  panelId: string,
  datasourceUrl: string
};
