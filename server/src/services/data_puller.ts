import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from './analytics_service';
import { HASTIC_API_KEY } from '../config';

import { queryByMetric } from 'grafana-datasource-kit';

import * as _ from 'lodash';


declare type UnitTime = {
  unit: AnalyticUnit.AnalyticUnit,
  time: number
};

export class DataPuller {

  private PULL_PERIOD_MS: number = 5000;
  private _interval: number = 1000;
  private _timer: any = null;
  private _unitTimes: { [id: string]: UnitTime } = {};

  constructor(private analyticsService: AnalyticsService){};

  public addUnit(unit: AnalyticUnit.AnalyticUnit) {
    let time = unit.lastDetectionTime || Date.now();
    let unitTime: UnitTime = {unit, time };
    this._unitTimes[unit.id] = unitTime;
  }

  public deleteUnit(id: AnalyticUnit.AnalyticUnitId) {
    delete this._unitTimes[id];
  }

  private pullData(unit: AnalyticUnit.AnalyticUnit, from: number, to: number) {
    if(!unit) {
      throw Error(`puller: can't pull undefined unit`);
    }
    return queryByMetric(unit.metric, unit.panelUrl, from, to, HASTIC_API_KEY);
  }

  private pushData(unit: AnalyticUnit.AnalyticUnit, data: any) {
    if(unit === undefined || data === undefined) {
      throw Error(`can't push unit: ${unit} data: ${data}`);
    }
    let task = new AnalyticsTask(unit.id, AnalyticsTaskType.PUSH, data);
    this.analyticsService.sendTask(task);
  }

  //TODO: group analyticUnits by panelID and send same dataset for group
  public runPuller() {
    this._timer = setTimeout(this.puller.bind(this), this._interval);
    console.log('Data puller runned');
  }

  public stopPuller() {
    if(this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
      this._interval = 0;
      console.log('Data puller stopped');
    }
    console.log('Data puller already stopped');
  }

  private async puller() {

    if(_.isEmpty(this._unitTimes)) {
      this._interval = this.PULL_PERIOD_MS;
      this._timer = setTimeout(this.puller.bind(this), this._interval);
      return;
    }

    let now = Date.now();

    _.forOwn(this._unitTimes, async (v, k) => {
      // TODO: add check for v.unit.alert status
      let data = await this.pullData(v.unit, v.time, now);
      if(data.values.length === 0) {
        return;
      }

      let payload = { data, from: v.time, to: now};
      v.time = now;
      this.pushData(v.unit, payload); 
    });
  
    this._timer = setTimeout(this.puller.bind(this), this._interval);
  }

}
