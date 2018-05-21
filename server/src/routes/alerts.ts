import * as express from 'express';
import {AnomalyId, getAnomalyIdByName, loadAnomalyById} from '../services/anomalyType';
import { getAlertsAnomalies, saveAlertsAnomalies } from '../services/alerts';

function getAlert(req, res) {
  try {
    let anomalyId: AnomalyId = req.query.anomaly_id;
    let anomaly = loadAnomalyById(anomalyId)
    if (anomaly == null) {
      anomalyId = getAnomalyIdByName(anomalyId.toLowerCase());
    }

    let alertsAnomalies = getAlertsAnomalies();
    let pos = alertsAnomalies.indexOf(anomalyId);

    let enable: boolean = (pos !== -1);
    res.status(200).send({
      enable
    });
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
}

function changeAlert(req, res) {
  try {
    let anomalyId: AnomalyId = req.body.anomaly_id;
    let enable: boolean = req.body.enable;

    let anomaly = loadAnomalyById(anomalyId)
    if (anomaly == null) {
      anomalyId = getAnomalyIdByName(anomalyId.toLowerCase());
    }

    let alertsAnomalies = getAlertsAnomalies();
    let pos: number = alertsAnomalies.indexOf(anomalyId);
    if(enable && pos == -1) {
      alertsAnomalies.push(anomalyId);
      saveAlertsAnomalies(alertsAnomalies);
    } else if(!enable && pos > -1) {
      alertsAnomalies.splice(pos, 1);
      saveAlertsAnomalies(alertsAnomalies);
    }
    res.status(200).send({
      status: 'Ok'
    });
  } catch(e) {
    res.status(500).send({
      code: 500,
      message: 'Internal error'
    });
  }
}

export const router = express.Router();

router.get('/', getAlert);
router.post('/', changeAlert);

