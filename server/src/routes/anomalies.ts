import * as express from 'express';

import {
  Metric,
  Anomaly,
  saveAnomaly,
  insertAnomaly, removeAnomaly, loadAnomalyByName, loadAnomalyById, getAnomalyIdByName
} from '../services/anomalyType';
import { runLearning } from '../services/analytics'
import { saveTargets } from '../services/metrics';

async function sendAnomalyTypeStatus(req, res) {
  let id = req.query.id;
  let name = req.query.name;
  try {
    let anomaly: Anomaly;
    if(id !== undefined) {
      anomaly = loadAnomalyById(id);
    } else {
      anomaly = loadAnomalyByName(name);
    }
    if(anomaly === null) {
      res.status(404).send({
        code: 404,
        message: 'Not found'
      });
      return;
    }
    if(anomaly.status === undefined) {
      throw new Error('No status for ' + name);
    }
    res.status(200).send({ status: anomaly.status });
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    res.status(500).send({ error: 'Can`t return anything' });
  }

}

async function getAnomaly(req, res) {
  try {
    let id = req.query.id;
    let name = req.query.name;

    let anomaly:Anomaly;
    if(id !== undefined) {
      anomaly = loadAnomalyById(id);
    } else {
      anomaly = loadAnomalyByName(name.toLowerCase());
    }
    if(anomaly === null) {
      res.status(404).send({
        code: 404,
        message: 'Not found'
      });
      return;
    }

    let payload = JSON.stringify({
      name: anomaly.name,
      metric: anomaly.metric,
      status: anomaly.status
    });
    res.status(200).send(payload)
  } catch(e) {
    console.error(e);
    // TODO: better send 404 when we know than isn`t found
    res.status(500).send('Can`t get anything');
  }
}

async function createAnomaly(req, res) {
  try {
    const metric:Metric = {
      datasource: req.body.metric.datasource,
      targets: saveTargets(req.body.metric.targets)
    };

    const anomaly:Anomaly = {
      name: req.body.name,
      panelUrl: req.body.panelUrl,
      metric: metric,
      status: 'learning',
      last_prediction_time: 0,
      next_id: 0
    };
    let anomalyId = insertAnomaly(anomaly);
    if(anomalyId === null) {
      res.status(403).send({
        code: 403,
        message: 'Already exists'
      });
    }

    let payload = JSON.stringify({ anomaly_id: anomalyId })
    res.status(200).send(payload);

    runLearning(anomalyId);
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
}

function deleteAnomaly(req, res) {
  try {
    let id = req.query.id;
    let name = req.query.name;

    if(id !== undefined) {
      removeAnomaly(id);
    } else {
      removeAnomaly(name.toLowerCase());
    }
    
    res.status(200).send({
      code: 200,
      message: 'Success'
    });
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
}

export const router = express.Router();

router.get('/status', sendAnomalyTypeStatus);
router.get('/', getAnomaly);
router.post('/', createAnomaly);
router.delete('/', deleteAnomaly);
