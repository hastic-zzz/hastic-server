import * as AnalyticsController from '../controllers/analytics_controller';
import * as AnalyticUnit from '../models/analytic_unit_model';
import * as AnalyticUnitCache from '../models/analytic_unit_cache_model';


import * as Router from 'koa-router';
import * as _ from 'lodash';

export enum DetectionState {
  READY = 'READY',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED'
}

declare type DetectionStatus = {
  id: AnalyticUnit.AnalyticUnitId,
  from: number,
  to: number,
  state: DetectionState
}

declare type DetectionStatusResponce = {
  timeranges: DetectionStatus[]
}

let detections: DetectionStatus[] = [];

export async function getDetectionStatus(ctx: Router.IRouterContext) {
  let id: AnalyticUnit.AnalyticUnitId = ctx.request.query.id;
  if(id === undefined || id === '') {
    throw new Error('analyticUnitId (id) is missing');
  }

  let from: number = +ctx.request.query.from;
  if(isNaN(from) || ctx.request.query.from === '') {
    throw new Error(`from is missing or corrupted (got ${ctx.request.query.from})`);
  }
  let to: number = +ctx.request.query.to;
  if(isNaN(to) || ctx.request.query.to === '') {
    throw new Error(`to is missing or corrupted (got ${ctx.request.query.to})`);
  }

  const unitCache = await AnalyticUnitCache.findById(id);
  const intersection = unitCache.getIntersection();
  const intersectedDetections: DetectionStatus[] = getIntersectedRegions({from, to}, detections);
  let rangesBorders: number[] = [];
  _.sortBy(intersectedDetections, 'from').map(d => {
    rangesBorders.push(d.from);
    rangesBorders.push(d.to);
  });
  insertToSorted(rangesBorders, from);
  insertToSorted(rangesBorders, to);

  let alreadyDetected = false;
  let startDetectionRange = null;
  let endDetectionRange = null;
  let newDetectionRanges: any[] = [];
  for(let border of rangesBorders) {
    if(border === from) {
      if(!alreadyDetected) {
        startDetectionRange = from;
      }
      continue;
    }

    if(border === to) {
      endDetectionRange = to;
      
      break;
    }

    if(alreadyDetected) { //end of already detected region, start point for new detection
      startDetectionRange = border;
    } else { //end of new detection region
      endDetectionRange = border;
      newDetectionRanges.push({from: startDetectionRange, to: endDetectionRange});
    }
    alreadyDetected = !alreadyDetected; //toggle 
  }

  const previousRun = _.find(detections, {id, from, to});
  if(previousRun !== undefined) {
    return {
      timeranges: [
        previousRun
      ]
    }
  }

  const currentRun = {
    id,
    from,
    to,
    state: DetectionState.RUNNING
  };
  detections.push(currentRun);
  
  AnalyticsController.runDetect(id, currentRun.from, currentRun.to)
  .then(() => _.find(detections, {id, from, to}).state = DetectionState.READY)
  .catch(err => {
    console.error(err);
    _.find(detections, {id, from, to}).state = DetectionState.FAILED;
  });

  const result: DetectionStatusResponce = {
    timeranges: [
      currentRun
    ]
  };
  ctx.response.body = result;
}

function getIntersectedRegions(range: any, ranges: any[], state?): any[] {
  const from = range.from;
  const to = range.to;
  if(state === undefined) {
    state = DetectionState.READY;
  }
  return ranges.filter(r => r.from <= to && r.to >= from && r.state === state);
}

function insertToSorted(array: number[], value: number) {
  return array.splice(_.sortedIndex(array, value), 0, value);
}


export const router = new Router();

router.get('/', getDetectionStatus);
