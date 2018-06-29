import * as Router from 'koa-router';

import {
  getLabeledSegments,
  insertSegments,
  removeSegments,
} from '../services/segments';

import {
  Anomaly, AnomalyId, getAnomalyIdByName, loadAnomalyById
} from '../services/anomalyType';

import { runLearning } from '../services/analytics';


async function sendSegments(ctx: Router.IRouterContext) {

  let anomalyId: AnomalyId = ctx.request.query.anomaly_id.toLowerCase();
  let anomaly:Anomaly = loadAnomalyById(anomalyId);
  if(anomaly === null) {
    anomalyId = getAnomalyIdByName(anomalyId);
  }

  let lastSegmentId = ctx.request.query.last_segment;
  let timeFrom = ctx.request.query.from;
  let timeTo = ctx.request.query.to;

  let segments = getLabeledSegments(anomalyId);

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

    let anomalyId = segmentsUpdate.anomaly_id;
    let anomalyName = segmentsUpdate.name.toLowerCase();

    if(anomalyId === undefined) {
      anomalyId = getAnomalyIdByName(anomalyName);
    }

    let addedIds = insertSegments(anomalyId, segmentsUpdate.added_segments, true);
    removeSegments(anomalyId, segmentsUpdate.removed_segments);

    ctx.response.body = { added_ids: addedIds };

    runLearning(anomalyId);
  } catch(e) {
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: 'Internal error'
    };
  }
}

export const router = new Router();

router.get('/', sendSegments);
router.patch('/', updateSegments);
