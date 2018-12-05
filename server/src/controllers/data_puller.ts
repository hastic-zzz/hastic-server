import { AnalyticsTask, AnalyticsTaskType } from '../models/analytics_task_model';
import * as AnalyticUnit from '../models/analytic_unit_model';
import { AnalyticsService } from '../services/analytics_service';
import { HASTIC_API_KEY } from '../config';

import { queryByMetric } from 'grafana-datasource-kit';

import * as _ from 'lodash';


declare type UnitTime = {
  unit: AnalyticUnit.AnalyticUnit,
  time: number
};

export class DataPuller {

  private PULL_PERIOD_MS: number = 2000;
  private _interval: number = 0;
  private _timer: number = null;
  private _unitTimes: { [id: string]: UnitTime } = {};

  constructor(private analyticsService: AnalyticsService){};

  public addUnit(unit: AnalyticUnit.AnalyticUnit) {
    let unitTime: UnitTime = {unit, time: 0};
    this._unitTimes[unit.id] = unitTime;
  }

  public deleteUnit(id: AnalyticUnit.AnalyticUnitId) {
    delete this._unitTimes[id];
  }

  private async pullData(unit: AnalyticUnit.AnalyticUnit, lastPullTime: number) {
    if(unit === undefined) {
      throw Error(`puller: can't pull undefined unit`);
    }
    let now = Date.now();
    return queryByMetric(unit.metric, unit.panelUrl, lastPullTime, now, HASTIC_API_KEY);
  }

  private async pushData(unit: AnalyticUnit.AnalyticUnit, data: any) {
    if(unit === undefined || data === undefined) {
      throw Error(`can't push unit: ${unit} data: ${data}`);
    }
    let task = new AnalyticsTask(unit.id, AnalyticsTaskType.DATA, data);
    this.analyticsService.sendTask(task);
  }

  //TODO: group analyticUnits by panelID and send same dataset for group
  public runPuller() {
    this._timer = setTimeout(this.puller.bind(this), this._interval);
    console.log('Data puller runned');
  }

  public stopPuller() {
    if(this._timer) {
      clearInterval(this._timer);
      this._timer = null;
      this._interval = 0;
      console.log('Data puller stopped');
    }
    console.log('Data puller already stopped');
  }

  private puller() {

    if(_.isEmpty(this._unitTimes)) {
      this._interval = this.PULL_PERIOD_MS;
      this._timer = setTimeout(this.puller.bind(this), this._interval);
      return;
    }

    let now = Date.now();
    let times = [];

    _.forOwn(this._unitTimes, async (v, k) => {
      if(v.time + this.PULL_PERIOD_MS - now < 0 ) {
        let data = await this.pullData(v.unit, v.time);
        v.time = now;
        times.push(v.time);
        this.pushData(v.unit, data);
      }
    });
    
    this._interval = _.min(times.map(u => Math.min(this.PULL_PERIOD_MS - now + u.time, 0)));
    this._timer = setTimeout(this.puller.bind(this), this._interval);
  }

}
