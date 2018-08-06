import * as Router from 'koa-router';

import { AnalyticUnitId } from '../models/analytic_unit_model';

import {
  getLabeledSegments,
  insertSegments,
  removeSegments,
} from '../models/segment_model';
import { runLearning } from '../controllers/analytics_controller';


async function sendSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;

  let lastSegmentId = ctx.request.query.lastSegmentId;
  let timeFrom = ctx.request.query.from;
  let timeTo = ctx.request.query.to;

  let segments = await getLabeledSegments(id);

  // // Id filtering
  // if(lastSegmentId !== undefined) {
  //   segments = segments.filter(el => el.id > lastSegmentId);
  // }

  // // Time filtering
  // if(timeFrom !== undefined) {
  //   segments = segments.filter(el => el.finish > timeFrom);
  // }

  // if(timeTo !== undefined) {
  //   segments = segments.filter(el => el.start < timeTo);
  // }

  ctx.response.body = { segments }

}

async function updateSegments(ctx: Router.IRouterContext) {
  try {
    let segmentsUpdate = ctx.request.body;
    let id = segmentsUpdate.id;
    let addedIds = insertSegments(id, segmentsUpdate.addedSegments);
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

router.get('/', sendSegments);
router.patch('/', updateSegments);
