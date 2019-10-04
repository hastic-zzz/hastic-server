import { TIMEZONE_UTC_OFFSET } from '../config';

import * as _ from 'lodash';
import * as moment from 'moment';

const MINUTES_IN_HOUR = 60;

export function parseTimeZone(timeZone: string): number {
  timeZone = timeZone.replace(/['|"]/, '');
  const re = /^-?\d{1,2}?:\d{2}$/;
  const correctFormat = re.test(timeZone);
  console.log('timezone: ', timeZone);
  if(!correctFormat) {
    throw new Error(`Wrong timeZone format in config - "TIMEZONE_UTC_OFFSET": ${timeZone}`);
  }
  const time = _.split(timeZone, ':');
  console.log('timearray: ', time);
  let minutesOffset = Math.abs(Number(time[0])) * MINUTES_IN_HOUR + Number(time[1]);
  if(timeZone.indexOf('-') !== -1) {
    minutesOffset = -1 * minutesOffset;
  }
  console.log('parseTimeZone minutesOffset :', minutesOffset);
  return minutesOffset;
}

export function toTimeZone(time: moment.MomentInput): string {
  const utcTime = moment(time).utc();
  console.log('toTimeZone utcTime: ', utcTime);
  console.log('toTimeZone utcTime: ', TIMEZONE_UTC_OFFSET);
  const timeWithOffset = utcTime.utcOffset(TIMEZONE_UTC_OFFSET);
  console.log('toTimeZone timeWithOffset: ', timeWithOffset);
  return timeWithOffset.format('ddd MMM DD YYYY HH:mm:ss');
}
