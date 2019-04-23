import { getNonIntersectedSpans } from '../../src/utils/spans';

import 'jest';

describe('getNonIntersectedSpans', function(){

  let spanBorders = [3, 5, 6, 8, 10, 20];
  
  it('functional test', function() {  
    expect(getNonIntersectedSpans(4, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(5, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(4, 10, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(5, 10, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(4, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(4, 21, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}, {from: 20, to: 21}]);
    expect(getNonIntersectedSpans(2, 20, spanBorders)).toEqual([{from: 2, to: 3}, {from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(2, 21, spanBorders)).toEqual([{from: 2, to: 3}, {from: 5, to: 6}, {from: 8, to: 10}, {from: 20, to: 21}]);
    expect(getNonIntersectedSpans(3, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(3, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(3, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getNonIntersectedSpans(4, 7, [3, 5, 6, 8])).toEqual([{from: 5, to: 6}]);
  });

  it('empty borders list', function() {
    expect(getNonIntersectedSpans(4, 10, [])).toEqual([]);
  });

  it('all in span', function() {
    expect(getNonIntersectedSpans(4, 10, [1, 20])).toEqual([]);
    expect(getNonIntersectedSpans(4, 10, [1, 10])).toEqual([]);
    expect(getNonIntersectedSpans(4, 10, [4, 20])).toEqual([]);
    expect(getNonIntersectedSpans(4, 10, [4, 10])).toEqual([]);
  });

});
