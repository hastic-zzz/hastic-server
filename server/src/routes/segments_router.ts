import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Segment from '../models/segment_model';

import * as Router from 'koa-router';


async function getSegments(ctx: Router.IRouterContext) {
  try {
    let id: AnalyticUnitId = ctx.request.query.id;
    if(id === undefined || id === '') {
      throw new Error('analyticUnitId (id) is missing');
    }
    let query: Segment.FindManyQuery = {};

    if(!isNaN(+ctx.request.query.lastSegmentId)) {
      query.intexGT = +ctx.request.query.lastSegmentId;
    }
    if(!isNaN(+ctx.request.query.from)) {
      query.timeFromGTE = +ctx.request.query.from;
    }
    if(!isNaN(+ctx.request.query.to)) {
      query.timeToLTE = +ctx.request.query.to;
    }

    let segments = await Segment.findMany(id, query);

    ctx.response.body = { segments };
  } catch(e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `GET /segments error: ${e.message}`
    };
  }
}

async function updateSegments(ctx: Router.IRouterContext) {
  try {

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
    
  } catch(e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `PATCH /segments (learning) error: ${e.message}`
    };
  }
}

export const router = new Router();

router.get('/', getSegments);
router.patch('/', updateSegments);
