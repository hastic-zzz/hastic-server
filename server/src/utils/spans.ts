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
      if(acc === []) return [s];
      if(s.to < acc[acc.length - 1].to) return acc;
      acc.push(s);
      return acc;
    }, []);
  
  var result = [inputSpan];

  for(let i in mergedSortedCuts) {
    var span = mergedSortedCuts[i];
    var last = result[result.length - 1];
    if(span.to < last.from) continue;
    

    
  }


  return result;


}
