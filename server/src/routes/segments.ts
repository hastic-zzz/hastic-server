import * as Router from 'koa-router';

import {
  getLabeledSegments,
  insertSegments,
  removeSegments,
} from '../services/segments';

import {
  AnalyticUnit, AnomalyUnitKey, getPredictorIdByName, loadPredictorById
} from '../models/analytic_unit';

import { runLearning } from '../services/analytics';


async function sendSegments(ctx: Router.IRouterContext) {

  let predictorId: AnomalyUnitKey = ctx.request.query.predictor_id.toLowerCase();
  let anomaly:AnalyticUnit = loadPredictorById(predictorId);
  if(anomaly === null) {
    predictorId = getPredictorIdByName(predictorId);
  }

  let lastSegmentId = ctx.request.query.last_segment;
  let timeFrom = ctx.request.query.from;
  let timeTo = ctx.request.query.to;

  let segments = getLabeledSegments(predictorId);

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

    let predictorId = segmentsUpdate.predictor_id;
    let anomalyName = segmentsUpdate.name.toLowerCase();

    if(predictorId === undefined) {
      predictorId = getPredictorIdByName(anomalyName);
    }

    let addedIds = insertSegments(predictorId, segmentsUpdate.added_segments, true);
    removeSegments(predictorId, segmentsUpdate.removed_segments);

    ctx.response.body = { added_ids: addedIds };

    runLearning(predictorId);
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
