export function availableReporter(
  positives: any|null,
  negatives: any|null,
  positiveAction=console.log,
  negativeAction=console.error,
) {
  let reported = false;
  return available => {
    if(available && reported) {
      reported = false;
      if(positives) {
        positiveAction.apply(null, positives);
      }
    }

    if(!available && !reported) {
      reported = true;
      if(negatives) {
        negativeAction.apply(null, negatives);
      }
    }
  }
};
