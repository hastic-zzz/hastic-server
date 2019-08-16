import { cutSpanWithSpans } from '../../src/utils/spans';

import 'jest';


function getCuts(from: number, to: number, xs: [number, number][]): [number, number][] {
  return cutSpanWithSpans(
    { from, to }, xs.map(([from, to]) => ({from, to}))
  ).map(({ from, to }) => [from, to]);
}


describe('cutSpanWithSpans', function() {

  it('should find spans in simple non-intersected borders', function() {
    let cutSpans = [[3, 5], [6, 8], [10, 20]] as [number, number][];

    expect(getCuts(4, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(5, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(4, 10, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(5, 10, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(4, 20, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(4, 21, cutSpans)).toEqual([[5, 6], [8, 10], [20, 21]]);
    expect(getCuts(2, 20, cutSpans)).toEqual([[2, 3], [5, 6], [8, 10]]);
    expect(getCuts(2, 21, cutSpans)).toEqual([[2, 3], [5, 6], [8, 10], [20, 21]]);
    expect(getCuts(3, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(3, 20, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(3, 20, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(getCuts(4, 7, [[3, 5], [6, 8]])).toEqual([[5, 6]]);
  });

  it('should handle empty input spans list case', function() {
    expect(getCuts(4, 10, [])).toEqual([[4, 10]]);
  });

  it('should handle case when from and to are inside of one big span', function() {
    expect(getCuts(4, 10, [[1, 20]])).toEqual([]);
    expect(getCuts(4, 10, [[1, 10]])).toEqual([]);
    expect(getCuts(4, 10, [[4, 20]])).toEqual([]);
    expect(getCuts(4, 10, [[4, 10]])).toEqual([]);
  });

});
