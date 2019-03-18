import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Threshold from '../models/threshold_model';

import * as Router from 'koa-router';
import * as _ from 'lodash';


async function getThresholds(ctx: Router.IRouterContext) {
  
  const ids: AnalyticUnitId[] = ctx.request.query.ids.split(',');

  if(ids === undefined) {
    throw new Error('analyticUnitIds (ids) are missing');
  }

  const thresholds = await Promise.all(
    _.map(ids, id => Threshold.findOne(id))
  );

  ctx.response.body = { thresholds };
  
}

async function updateThreshold(ctx: Router.IRouterContext) {
  const {
    id, value, condition
  } = ctx.request.body as {
    id: AnalyticUnitId, value: number, condition: Threshold.Condition
  };

  await AnalyticsController.updateThreshold(id, value, condition);

  ctx.response.body = {
    code: 200,
    message: 'Success'
  };
}

export const router = new Router();

router.get('/', getThresholds);
router.patch('/', updateThreshold);
