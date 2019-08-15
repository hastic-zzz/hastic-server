import { getNonIntersectedSpans as getSpans } from '../../src/utils/spans';

import 'jest';


describe('getNonIntersectedSpans', function() {

  it('should find spans in simple non-intersected borders', function() {
    let spanBorders = [3, 5, 6, 8, 10, 20];

    expect(getSpans(4, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(5, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(4, 10, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(5, 10, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(4, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(4, 21, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}, {from: 20, to: 21}]);
    expect(getSpans(2, 20, spanBorders)).toEqual([{from: 2, to: 3}, {from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(2, 21, spanBorders)).toEqual([{from: 2, to: 3}, {from: 5, to: 6}, {from: 8, to: 10}, {from: 20, to: 21}]);
    expect(getSpans(3, 11, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(3, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(3, 20, spanBorders)).toEqual([{from: 5, to: 6}, {from: 8, to: 10}]);
    expect(getSpans(4, 7, [3, 5, 6, 8])).toEqual([{from: 5, to: 6}]);
  });

  it('should handle empty input spans list case', function() {
    expect(getSpans(4, 10, [])).toEqual([]);
  });

  it('should handle case when from and to are inside of one big span', function() {
    expect(getSpans(4, 10, [1, 20])).toEqual([]);
    expect(getSpans(4, 10, [1, 10])).toEqual([]);
    expect(getSpans(4, 10, [4, 20])).toEqual([]);
    expect(getSpans(4, 10, [4, 10])).toEqual([]);
  });

});
