export function availableReporter(
  positiveArgs: any|null,
  negativeArgs: any|null,
  positiveAction=console.log,
  negativeAction=console.error,
) {
  let reported = false;
  return available => {
    if(available && reported) {
      reported = false;
      if(positiveArgs) {
        if(!(positiveArgs instanceof Array)) {
          positiveArgs = [ positiveArgs ];
        }
        positiveAction.apply(null, positiveArgs);
      }
    }

    if(!available && !reported) {
      reported = true;
      if(negativeArgs) {
        if(!(negativeArgs instanceof Array)) {
          negativeArgs = [ negativeArgs ];
        }
        negativeAction.apply(null, negativeArgs);
      }
    }
  }
};
