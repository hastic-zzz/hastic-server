export function availableReporter(
  positiveMsg: string|null,
  negativeMsg: string|null,
  positiveAction = console.log,
  negativeAction = console.error,
) {
  let reported = false;
  return available => {
    if(available && reported) {
      reported = false;
      if(positiveMsg) {
        positiveAction(positiveMsg);
      }
    }

    if(!available && !reported) {
      reported = true;
      if(negativeMsg) {
        negativeAction(negativeMsg);
      }
    }
  }
};
