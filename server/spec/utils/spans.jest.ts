import { insertToSorted, getIntersectedDetections, getNonIntersectedSpans } from '../../src/utils/spans';

import 'jest';

describe('correct insertion to sorted array', function(){

  it('smoke test', function() {
    let array = [0, 1, 2, 4, 5];
    insertToSorted(array, 3);
    expect(array).toEqual([0, 1, 2, 3, 4, 5]);
  });

});
