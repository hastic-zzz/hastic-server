import * as Router from 'koa-router';

import { AnalyticUnitId } from '../models/analytic_unit_model';

import {
  findMany,
  insertSegments,
  removeSegments,
} from '../models/segment_model';
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
    let segmentsUpdate = ctx.request.body;
    let id = segmentsUpdate.id;
    let addedIds = insertSegments(segmentsUpdate.addedSegments);
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
