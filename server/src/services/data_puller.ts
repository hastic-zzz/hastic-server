import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';
import { AnalyticsService } from './analytics_service';
import { HASTIC_API_KEY, GRAFANA_URL } from '../config';
import { availableReporter } from '../utils/reporter';
import { AlertService } from './alert_service';

import { queryByMetric, ConnectionRefused } from 'grafana-datasource-kit';

import * as _ from 'lodash';


type MetricDataChunk = { values: [number, number][], columns: string[] };

const PULL_PERIOD_MS = 5000;

export class DataPuller {

  private _analyticReadyConsoleReporter = availableReporter(
    'data puller: analytic ready, start pushing',
    'data puller: analytic service not ready, return empty result'
  );

  private _grafanaAvailableConsoleReporter = availableReporter(
    'data puller: connected to Grafana',
    `data puller: can't connect to Grafana. Check GRAFANA_URL`
  );

  private _unitTimes: { [analyticUnitId: string]: number } = {};
  private _grafanaAvailableWebhook: Function;

  constructor(private analyticsService: AnalyticsService) {
    const _alertService = new AlertService();
    this._grafanaAvailableWebhook = _alertService.getGrafanaAvailableReporter();
  };

  public addUnit(analyticUnit: AnalyticUnit.AnalyticUnit) {
    console.log(`start pulling analytic unit ${analyticUnit.id}`);
    this._runAnalyticUnitPuller(analyticUnit);
  }

  public deleteUnit(analyticUnitId: AnalyticUnit.AnalyticUnitId) {
    if(_.has(this._unitTimes, analyticUnitId)) {
      delete this._unitTimes[analyticUnitId];
      console.log(`analytic unit ${analyticUnitId} deleted from data puller`);
    }
  }

  private async pullData(unit: AnalyticUnit.AnalyticUnit, from: number, to: number): Promise<MetricDataChunk> {
    if(unit === undefined) {
      throw Error(`data puller: can't pull undefined unit`);
    }

    let panelUrl;
    if(GRAFANA_URL !== null) {
      panelUrl = GRAFANA_URL;
    } else {
      panelUrl = unit.panelUrl;
    }

    let data = queryByMetric(unit.metric, panelUrl, from, to, HASTIC_API_KEY);
    return data;
    
  }

  private pushData(unit: AnalyticUnit.AnalyticUnit, data: any) {
    if(unit === undefined || data === undefined) {
      throw Error(`data puller can't push unit: ${unit} data: ${data}`);
    }
    let task = new AnalyticsTask(unit.id, AnalyticsTaskType.PUSH, data);

    try {
      this.analyticsService.sendTask(task);
      let fromTime = new Date(data.from).toLocaleTimeString();
      let toTime = new Date(data.to).toLocaleTimeString();
      console.log(`pushed ${data.data.length} points to unit: ${unit.id} ${fromTime}-${toTime}`);
    } catch(e) {
      console.log(`data puller got error while push data ${e.message}`);
    }
  }

  //TODO: group analyticUnits by panelID and send same dataset for group
  public async runPuller() {
    const analyticUnits = await AnalyticUnit.findMany({ alert: true });

    console.log(`starting data puller with ${JSON.stringify(analyticUnits.map(u => u.id))} analytic units`);

    _.each(analyticUnits, analyticUnit => {
      this._runAnalyticUnitPuller(analyticUnit);
    });

    console.log('data puller started');
  }

  public stopPuller() {
    this._unitTimes = {};
    console.log('data puller stopped');
  }

  private async _runAnalyticUnitPuller(analyticUnit: AnalyticUnit.AnalyticUnit) {
    console.log(`run data puller for analytic unit ${analyticUnit.id}`);
    // TODO: lastDetectionTime can be in ns
    const time = analyticUnit.lastDetectionTime + 1 || Date.now();
    this._unitTimes[analyticUnit.id] = time;

    const dataGenerator = this.getDataGenerator(
      analyticUnit, PULL_PERIOD_MS
    );

    for await (const data of dataGenerator) {
      if(!_.has(this._unitTimes, analyticUnit.id)) {
        console.log(`data puller: ${analyticUnit.id} not in _unitTimes, break`);
        break;
      }

      if(data.values.length === 0) {
        continue;
      }

      const now = Date.now();
      let payloadValues = data.values;
      let cache = await AnalyticUnitCache.findById(analyticUnit.id);
      if(cache !== null) {
        cache = cache.data
      }
      const detector = AnalyticUnit.getDetectorByType(analyticUnit.type);
      let payload = {
        data: payloadValues,
        from: this._unitTimes[analyticUnit.id],
        to: now,
        analyticUnitType: analyticUnit.type,
        detector,
        cache
      };
      this.pushData(analyticUnit, payload);
      this._unitTimes[analyticUnit.id] = now;
    }
  }

  async * getDataGenerator(analyticUnit: AnalyticUnit.AnalyticUnit, duration: number):
    AsyncIterableIterator<MetricDataChunk> {

    const getData = async () => {
      this._analyticReadyConsoleReporter(this.analyticsService.ready);
      if(!this.analyticsService.ready) {
        return {
          columns: [],
          values: []
        };
      }

      try {
        const time = this._unitTimes[analyticUnit.id]
        const now = Date.now();
        const res = await this.pullData(analyticUnit, time, now);
        this._grafanaAvailableConsoleReporter(true);
        this._grafanaAvailableWebhook(true);
        return res;
      } catch(err) {

        if(err instanceof ConnectionRefused) {
          this._grafanaAvailableConsoleReporter(false);
          this._grafanaAvailableWebhook(false);
        } else {
          console.error(`error while pulling data: ${err.message}`);
        }

        return {
          columns: [],
          values: []
        };
      }
    }

    const timeout = async () => new Promise(
      resolve => setTimeout(resolve, duration)
    );

    while(true) {
      yield await getData();
      await timeout();
    }
  }

}
