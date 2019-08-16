import { cutSpanWithSpans } from '../../src/utils/spans';

import 'jest';


function cutSpan(from: number, to: number, cuts: [number, number][]): [number, number][] {
  return cutSpanWithSpans(
    { from: from, to: to },
    cuts.map(([from, to]) => ({ from, to }))
  ).map(({ from, to }) => [from, to]);
}

describe('cutSpanWithSpans', function() {

  it('should find spans in simple non-intersected borders', function() {
    let cutSpans = [[3, 5], [6, 8], [10, 20]] as [number, number][];

    expect(cutSpan(4, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(5, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(4, 10, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(5, 10, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(4, 20, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(4, 21, cutSpans)).toEqual([[5, 6], [8, 10], [20, 21]]);
    expect(cutSpan(2, 20, cutSpans)).toEqual([[2, 3], [5, 6], [8, 10]]);
    expect(cutSpan(2, 21, cutSpans)).toEqual([[2, 3], [5, 6], [8, 10], [20, 21]]);
    expect(cutSpan(3, 11, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(3, 20, cutSpans)).toEqual([[5, 6], [8, 10]]);
    expect(cutSpan(4, 7, [[3, 5], [6, 8]])).toEqual([[5, 6]]);
  });

  it('should handle empty input spans list case', function() {
    expect(cutSpan(4, 10, [])).toEqual([[4, 10]]);
  });

  it('should handle case when from and to are inside of one big span', function() {
    expect(cutSpan(4, 10, [[1, 20]])).toEqual([]);
    expect(cutSpan(4, 10, [[1, 10]])).toEqual([]);
    expect(cutSpan(4, 10, [[4, 20]])).toEqual([]);
    expect(cutSpan(4, 10, [[4, 10]])).toEqual([]);
  });

  it('should be ready to get not-sorted cuts', function() {
    expect(cutSpan(0, 20, [[3, 5], [1, 2]])).toEqual([[0, 1], [2, 3], [5, 20]]);
    expect(cutSpan(0, 20, [[3, 5], [1, 2], [0.1, 0.5]])).toEqual([[0, 0.1], [0.5, 1], [2, 3], [5, 20]]);
  });

  it('should be ready to get overlayed cuts', function() {
    expect(cutSpan(0, 20, [[3, 5], [4, 10]])).toEqual([[0,3], [10, 20]]);
  });

});
