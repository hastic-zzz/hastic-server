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

  let anomalyId: AnomalyId = ctx.query.anomaly_id;
  let anomaly:Anomaly = loadAnomalyById(anomalyId);
  if(anomaly === null) {
    anomalyId = getAnomalyIdByName(anomalyId);
  }

  let lastSegmentId = ctx.query.last_segment;
  let timeFrom = ctx.query.from;
  let timeTo = ctx.query.to;

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

async function updateSegments(req, res) {
  try {
    let segmentsUpdate = req.body;

    let anomalyId = segmentsUpdate.anomaly_id;
    let anomalyName = segmentsUpdate.name;

    if(anomalyId === undefined) {
      anomalyId = getAnomalyIdByName(anomalyName.toLowerCase());
    }

    let addedIds = insertSegments(anomalyId, segmentsUpdate.added_segments, true);
    removeSegments(anomalyId, segmentsUpdate.removed_segments);

    let payload = JSON.stringify({ added_ids: addedIds });
    res.status(200).send(payload);

    runLearning(anomalyId);
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
}

export const router = new Router();

router.get('/', sendSegments);
router.patch('/', updateSegments);
