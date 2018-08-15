import * as Router from 'koa-router';

import { AnalyticUnitId } from '../models/analytic_unit_model';

import * as SegmentModel from '../models/segment_model';
import { runLearning } from '../controllers/analytics_controller';


async function getSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }
  let query: SegmentModel.FindManyQuery = {};

  if(!isNaN(+ctx.request.query.lastSegmentId)) {
    query.intexGT = +ctx.request.query.lastSegmentId;
  }
  if(!isNaN(+ctx.request.query.from)) {
    query.timeFromGTE = +ctx.request.query.from;
  }
  if(!isNaN(+ctx.request.query.to)) {
    query.timeToLTE = +ctx.request.query.to;
  }

  let segments = await SegmentModel.findMany(id, query);

  ctx.response.body = { segments };

}

async function updateSegments(ctx: Router.IRouterContext) {
  try {

    let {
      addedSegments, id, removedSegments: removedIds
    } = ctx.request.body as {
      addedSegments: any[], id: AnalyticUnitId, removedSegments: SegmentModel.SegmentId[]
    };

    let segmentsToInsert: SegmentModel.Segment[] = addedSegments.map(
      s => SegmentModel.Segment.fromObject({ analyticUnitId: id, labeled: true, ...s })
    );

    let [addedIds, removed] = await Promise.all([
      SegmentModel.insertSegments(segmentsToInsert),
      SegmentModel.removeSegments(removedIds)
    ]);

    ctx.response.body = { addedIds, removed };
    runLearning(id);
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `Learning error: ${e.message}`
    };
  }
}

export const router = new Router();

router.get('/', getSegments);
router.patch('/', updateSegments);
