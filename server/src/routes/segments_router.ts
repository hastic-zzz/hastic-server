import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_units';
import * as Segment from '../models/segment_model';

import * as Router from 'koa-router';


export async function getSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }
  let query: Segment.FindManyQuery = {};

  if(!isNaN(+ctx.request.query.from)) {
    query.from = { $lte: +ctx.request.query.to };
  }
  if(!isNaN(+ctx.request.query.to)) {
    query.to = { $gte: +ctx.request.query.from };
  }
  let segments = await Segment.findMany(id, query);
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
