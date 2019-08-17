import { cutSpanWithSpans } from '../../src/utils/spans';

import 'jest';


function cutSpan(from: number, to: number, cuts: [number, number][]): [number, number][] {
  return cutSpanWithSpans(
    { from: from, to: to },
    cuts.map(([from, to]) => ({ from, to }))
  ).map(({ from, to }) => [from, to] as [number, number]);
}

describe('cutSpanWithSpans', function() {

  it('should find spans in simple non-intersected borders', function() {
    let cutSpans = [[3, 4], [6, 8], [11, 20]] as [number, number][];

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

  it('should throw error is cut contains float border', function() {
    expect(cutSpan(1, 10, [[0.9, 0.0]])).toThrow();
  });

  it('should handle one-point cuts', function() {
    expect(cutSpan(1, 10, [[5, 5]])).toEqual([[1, 4], [6, 10]]);
    expect(cutSpan(1, 10, [[1, 1]])).toEqual([[2, 10]]);
    expect(cutSpan(1, 10, [[10, 10]])).toEqual([[1, 9]]);
    expect(cutSpan(1, 10, [[11, 11]])).toEqual([[1, 10]]);
  });

  it('should handle infitie span and infinite cuts', function() {
    expect(cutSpan(0, Infinity, [[5, 10]])).toEqual([[0, 5], [10, Infinity]]);
    expect(cutSpan(0, 6, [[0, Infinity]])).toEqual([]);
    expect(cutSpan(0, 6, [[1, Infinity]])).toEqual([[0, 1]]);
    expect(cutSpan(-Infinity, Infinity, [[-Infinity, Infinity]])).toEqual([]);
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
    expect(cutSpan(0, 20, [[3, 5], [4, 10]])).toEqual([[0, 3], [10, 20]]);
    expect(cutSpan(0, 20, [[3, 10], [4, 10]])).toEqual([[0, 3], [10, 20]]);
    expect(cutSpan(0, 20, [[3, 11], [4, 10]])).toEqual([[0, 3], [11, 20]]);
    expect(cutSpan(0, 20, [[3, 11], [3, 12]])).toEqual([[0, 3], [12, 20]]);
    expect(cutSpan(0, 20, [[3, 11], [3, 12], [3, 10], [3, 15], [3, 14]])).toEqual([[0, 3], [15, 20]]);
    expect(cutSpan(0, 20, [[2, 11], [3, 12]])).toEqual([[0, 2], [12, 20]]);
    expect(cutSpan(0, 20, [[2, 15], [3, 12]])).toEqual([[0, 2], [15, 20]]);
    expect(cutSpan(0, 20, [[2, 15], [3, 12], [1, 18]])).toEqual([[0, 1], [18, 20]]);
    expect(cutSpan(0, 20, [[2, 15], [3, Infinity], [1, 18]])).toEqual([[0, 1]]);
    expect(cutSpan(0, 20, [[3, 3], [3, Infinity]])).toEqual([[0, 3]]);
    expect(cutSpan(0, 20, [[3, 3], [3, Infinity], [3, 3]])).toEqual([[0, 3]]);
    expect(cutSpan(0, 20, [[3, 3], [3, Infinity], [3, 3], [4, 4]])).toEqual([[0, 3]]);
    expect(cutSpan(0, 20, [[3, 3], [3, Infinity], [3, 3], [4, 4], [3, 5]])).toEqual([[0, 3]]);
    expect(cutSpan(-Infinity, Infinity, [[3, 3], [3, Infinity], [3, 3], [4, 4], [3, 5]])).toEqual([[-Infinity, 3]]);
  });


  it('should handle cuts from point span', function() {
    expect(cutSpan(1, 1, [[5, 5]])).toThrowError()
    expect(cutSpan(1, 1, [[1, 1]])).toEqual([[]]);
    expect(cutSpan(1, 1, [[0, 2]])).toEqual([[]]);
    expect(cutSpan(1, 1, [[0, 1]])).toEqual([[]]);
    expect(cutSpan(1, 1, [[1, 0]])).toEqual([[]]);
  });

});
