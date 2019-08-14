import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_units';
import * as Segment from '../models/segment_model';

import * as Router from 'koa-router';


export async function getSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }
  const from = +ctx.request.query.from;
  if(isNaN(from)) {
    throw new Error(`from is not a number: ${ctx.request.query.from}`);
  }
  const to = +ctx.request.query.to;
  if(isNaN(to)) {
    throw new Error(`to is not a number: ${ctx.request.query.to}`);
  }

  const segments = await Segment.findIntersectedSegments(id, from, to);
  ctx.response.body = { segments };
}

async function updateSegments(ctx: Router.IRouterContext) {
  const {
    addedSegments, id, removedSegments: removedIds
  } = ctx.request.body as {
    addedSegments: any[], id: AnalyticUnitId, removedSegments: Segment.SegmentId[]
  };

  const segmentsToInsert: Segment.Segment[] = addedSegments.map(
    s => Segment.Segment.fromObject({ analyticUnitId: id, ...s })
  );

  const { addedIds } = await AnalyticsController.updateSegments(
    id, segmentsToInsert, removedIds
  );

  ctx.response.body = { addedIds }; 
}

export const router = new Router();

router.get('/', getSegments);
router.patch('/', updateSegments);
