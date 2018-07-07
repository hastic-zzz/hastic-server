import * as Router from 'koa-router';

import {
  getLabeledSegments,
  insertSegments,
  removeSegments,
} from '../services/segments';

import {
  AnalyticUnit, AnalyticUnitId, loadById
} from '../models/analytic_unit';

import { runLearning } from '../services/analytics';


async function sendSegments(ctx: Router.IRouterContext) {
  let id: AnalyticUnitId = ctx.request.query.id;
  let unit: AnalyticUnit = loadById(id);

  if(unit === null) {
    throw new Error(`Can't find Analitic unit with id ${id}`);
  }

  let lastSegmentId = ctx.request.query.lastSegmentId;
  let timeFrom = ctx.request.query.from;
  let timeTo = ctx.request.query.to;

  let segments = getLabeledSegments(id);

  // Id filtering
  if(lastSegmentId !== undefined) {
    segments = segments.filter(el => el.id > lastSegmentId);
  }

  // Time filtering
  if(timeFrom !== undefined) {
    segments = segments.filter(el => el.finish > timeFrom);
  }

  if(timeTo !== undefined) {
    segments = segments.filter(el => el.start < timeTo);
  }

  ctx.response.body = { segments }

}

async function updateSegments(ctx: Router.IRouterContext) {
  try {
    let segmentsUpdate = ctx.request.body;

    let key = segmentsUpdate.analyticUnitKey;

    let addedIds = insertSegments(key, segmentsUpdate.addedSegments, true);
    removeSegments(key, segmentsUpdate.removedSegments);

    ctx.response.body = { addedIds };

    runLearning(key);
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
