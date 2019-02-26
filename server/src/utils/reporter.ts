import * as _ from 'lodash';

export function availableReporter(
  positiveArgs: any|null,
  negativeArgs: any|null,
  positiveAction = console.log,
  negativeAction = console.error,
) {
  let reported = false;
  return available => {
    if(available && reported) {
      reported = false;
      if(positiveArgs) {
        if(!_.isArray(positiveAction)) {
          positiveArgs = [ positiveArgs ];
        }
        positiveAction.apply(null, positiveArgs);
      }
    }

    if(!available && !reported) {
      reported = true;
      if(negativeArgs) {
        if(!_.isArray(negativeArgs)) {
          negativeArgs = [ negativeArgs ];
        }
        negativeAction.apply(null, negativeArgs);
      }
    }
  }
};
