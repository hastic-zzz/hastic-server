import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Segment from '../models/segment_model';
import * as SegmentService from '../services/segment_service';

import * as Router from 'koa-router';


async function getSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }

  let lastSegmentId = undefined;
  let from = undefined;
  let to = undefined;

  if(!isNaN(+ctx.request.query.lastSegmentId)) {
    lastSegmentId = +ctx.request.query.lastSegmentId;
  }
  if(!isNaN(+ctx.request.query.from)) {
    from = +ctx.request.query.from;
  }
  if(!isNaN(+ctx.request.query.to)) {
    to = +ctx.request.query.to;
  }
  
  const segments: Segment.Segment[] = await SegmentService.getSegments(id, from, to, lastSegmentId);
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
