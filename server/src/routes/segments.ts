import * as express from 'express';
import {
  getLabeledSegments,
  insertSegments,
  removeSegments,
} from '../services/segments';
import {runLearning} from '../services/analytics';
import {Anomaly, AnomalyId, getAnomalyIdByName, loadAnomalyById} from '../services/anomalyType';


async function sendSegments(req, res) {
  try {
    let anomalyId: AnomalyId = req.query.anomaly_id;
    let anomaly:Anomaly = loadAnomalyById(anomalyId);
    if(anomaly === null) {
      anomalyId = getAnomalyIdByName(anomalyId);
    }

    let lastSegmentId = req.query.last_segment;
    let timeFrom = req.query.from;
    let timeTo = req.query.to;

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

    let payload = JSON.stringify({
      segments
    });
    res.status(200).send(payload);
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
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

export const router = express.Router();

router.get('/', sendSegments);
router.patch('/', updateSegments);
