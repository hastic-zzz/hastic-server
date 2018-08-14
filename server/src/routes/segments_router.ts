import * as Router from 'koa-router';

import { AnalyticUnitId } from '../models/analytic_unit_model';

import * as SegmentModel from '../models/segment_model';
import { runLearning } from '../controllers/analytics_controller';


async function getSegments(ctx: Router.IRouterContext) {
  // let id: AnalyticUnitId = ctx.request.query.id;

  // let segments = await findMany(id, {
  //   intexGT: ctx.request.query.lastSegmentId, 
  //   timeFromGTE:  ctx.request.query.from, 
  //   timeToLTE: ctx.request.query.to
  // });

  ctx.response.body = { segments: [] };

}

async function updateSegments(ctx: Router.IRouterContext) {
  try {
    
    let { addedSegments, id } = ctx.request.body as { addedSegments: any[], id: AnalyticUnitId };

    let segmentsToInsert: SegmentModel.Segment[] = addedSegments.map(
      s => SegmentModel.Segment.fromObject({ analyticUnitId: id, labeled: true, ...s })
    );
    
    let addedIds = await SegmentModel.insertSegments(segmentsToInsert);
    // removeSegments(id, segmentsUpdate.removedSegments);
    ctx.response.body = { addedIds };
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
