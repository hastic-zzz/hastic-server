import * as AnalyticUnit from '../models/analytic_units';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import * as DetectionSpan from '../models/detection_model';
import * as Segment from '../models/segment_model';


export async function exportPanel(panelId: string): Promise<{
  analyticUnitTemplates: any[],
  caches: AnalyticUnitCache.AnalyticUnitCache[],
  detectionSpans: DetectionSpan.DetectionSpan[],
  segments: Segment.Segment[]
}> {
  const analyticUnits = await AnalyticUnit.findMany({ panelId });
  const analyticUnitIds = analyticUnits.map(analyticUnit => analyticUnit.id);
  const analyticUnitTemplates = analyticUnits.map(analyticUnit => analyticUnit.toTemplate());

  const [caches, detectionSpans, segments] = await Promise.all([
    AnalyticUnitCache.findMany({ _id: { $in: analyticUnitIds } }),
    DetectionSpan.findByAnalyticUnitIds(analyticUnitIds),
    Segment.findByAnalyticUnitIds(analyticUnitIds)
  ]);

  return {
    analyticUnitTemplates,
    caches,
    detectionSpans,
    segments
  };
}
