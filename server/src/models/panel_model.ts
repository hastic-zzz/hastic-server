import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';

export type PanelTemplate = {
  // TODO: not any
  analyticUnitTemplates: any[],
  caches: AnalyticUnitCache.AnalyticUnitCache[],
  detectionSpans: DetectionSpan.DetectionSpan[],
  segments: Segment.Segment[]
}
