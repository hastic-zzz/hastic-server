import * as AnalyticsController from '../controllers/analytics_controller';

import { AnalyticUnitId } from '../models/analytic_unit_model';
import * as Threshold from '../models/threshold_model';

import * as Router from 'koa-router';
import * as _ from 'lodash';


async function getThresholds(ctx: Router.IRouterContext) {
  try {
    const ids: AnalyticUnitId[] = ctx.request.query.ids.split(',');

    if(ids === undefined) {
      throw new Error('analyticUnitIds (ids) are missing');
    }

    const thresholds = await Promise.all(
      _.map(ids, id => Threshold.findOne(id))
    );

    ctx.response.body = { thresholds };
  } catch(e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `GET /threshold error: ${e.message}`
    };
  }
}

async function updateThreshold(ctx: Router.IRouterContext) {
  try {
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
  } catch(e) {
    console.error(e);
    ctx.response.status = 500;
    ctx.response.body = {
      code: 500,
      message: `PATCH /threshold error: ${e.message}`
    };
  }
}

export const router = new Router();

router.get('/', getThresholds);
router.patch('/', updateThreshold);
