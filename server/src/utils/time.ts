import { TIMEZONE_UTC_OFFSET } from '../config';

import * as _ from 'lodash';
import * as moment from 'moment';

const MINUTES_IN_HOUR = 60;

export function parseTimeZone(timeZone: string): number {
  timeZone = timeZone.replace(/['|"]/g, '');
  const re = /^-?\d{1,2}?:\d{2}$/;
  const correctFormat = re.test(timeZone);
  if(!correctFormat) {
    throw new Error(`Wrong timeZone format in config - "TIMEZONE_UTC_OFFSET": ${timeZone}`);
  }
  const time = _.split(timeZone, ':');
  let minutesOffset = Math.abs(Number(time[0])) * MINUTES_IN_HOUR + Number(time[1]);
  if(timeZone.indexOf('-') !== -1) {
    minutesOffset = -1 * minutesOffset;
  }
  return minutesOffset;
}

export function toTimeZone(time: moment.MomentInput): string {
  const utcTime = moment(time).utc();
  const timeWithOffset = utcTime.utcOffset(TIMEZONE_UTC_OFFSET);
  const timeInfo = timeWithOffset.format('ddd MMM DD YYYY HH:mm:ss') + `(UTC ${getTimeFromMins(TIMEZONE_UTC_OFFSET)})`;
  return timeInfo;
}

function getTimeFromMins(mins: number): string {
  let sign = '+';
  if(mins < 0) {
    sign = '-';
  }
  let hours = Math.abs(Math.trunc(mins / MINUTES_IN_HOUR)).toString();
  let minutes = Math.abs(mins % MINUTES_IN_HOUR).toString();
  if(minutes.length === 1) {
    minutes = '0' + minutes;
  }
  return sign + hours + ':' + minutes;
};
