//TODO: move this code to span model

import * as _ from 'lodash';


export declare type Span = {
  from: number,
  to: number
}

// TODO: move from utils and refactor
/**
 *
 * @param inputSpan a big span which we will cut
 * @param cutSpans spans which to cut the fromSpan
 *
 * @returns array of spans which are holes
 */
export function cutSpanWithSpans(inputSpan: Span, cutSpans: Span[]): Span[] {
  if(cutSpans.length === 0) {
    return [inputSpan];
  }

  var mergedSortedCuts =_(cutSpans)
    .sortBy(s => s.from)
    .takeWhile(s => s.from < inputSpan.to)
    .reduce((acc: Span[], s: Span) => {
      if(acc.length === 0) return [s];
      var last = acc[acc.length - 1];
      if(s.to <= last.to) return acc;
      if(s.from <= last.to) {
        last.to = s.to;
        return acc;
      }
      acc.push(s);
      return acc;
    }, []);

  var holes = mergedSortedCuts.map((cut, i) => {
    var from = -Infinity;
    var to = cutSpans[0].from;
    if(i > 0) {
      from = mergedSortedCuts[i - 1].to;
      to = cut.from;
    }
    return { from, to }
  }).concat({
    from: mergedSortedCuts[mergedSortedCuts.length - 1].to,
    to: Infinity
  });

  return _(holes).map(c => {
    if(c.to <= inputSpan.from) return undefined;
    if(inputSpan.to <= c.from) return undefined;
    return {
      from: Math.max(c.from, inputSpan.from),
      to: Math.min(c.to, inputSpan.to),
    }
  }).compact().value();

}
