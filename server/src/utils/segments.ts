//TODO: move this code to span model

import * as _ from 'lodash';


export declare type Segment = {
  from: number,
  to: number
}

export function isInteger(s: Segment): boolean {
  return Number.isInteger(s.from) && Number.isInteger(s.to);
}

export function toString(s: Segment): string {
  return `[${s.from}, ${s.to}]`;
}

// TODO: move from utils and use generator
/**
 *
 * @param inputSegment a big span which we will cut
 * @param cutSegments spans which to cut the inputSpan. Spans can overlay.
 *
 * @returns array of segments remain after cut
 */
export function cutSegmentWithSegments(inputSegment: Segment, cutSegments: Segment[]): Segment[] {

  if(!isInteger(inputSegment)) {
    throw new Error('Input segment isn`t integer: ' + toString(inputSegment));
  }

  if(cutSegments.length === 0) {
    return [inputSegment];
  }

  {
    let badCut = _.find(cutSegments, s => !isInteger(s));
    if(badCut !== undefined) {
      throw new Error('Found not integer cut: ' + toString(badCut));
    }
  }

  // we sort and merge out cuts to normalize it
  cutSegments = _.sortBy(cutSegments, s => s.from);
  const mergedSortedCuts =_.reduce(cutSegments, 
    ((acc: Segment[], s: Segment) => {
      if(acc.length === 0) return [s];
      let last = acc[acc.length - 1];
      if(s.to <= last.to) return acc;
      if(s.from <= last.to) {
        last.to = s.to;
        return acc;
      }
      acc.push(s);
      return acc;
    }), []
  );

  // this is what we get if we cut `mergedSortedCuts` from (-Infinity, Infinity)
  const holes = mergedSortedCuts.map((cut, i) => {
    let from = -Infinity;
    let to = cutSegments[0].from - 1;
    if(i > 0) {
      from = mergedSortedCuts[i - 1].to + 1;
      to = cut.from - 1;
    }
    return { from, to };
  }).concat({
    from: mergedSortedCuts[mergedSortedCuts.length - 1].to + 1,
    to: Infinity
  });

  const holesInsideInputSpan = _(holes).map(c => {
    if(c.to <= inputSegment.from) return undefined;
    if(inputSegment.to <= c.from) return undefined;
    return {
      from: Math.max(c.from, inputSegment.from),
      to: Math.min(c.to, inputSegment.to),
    }
  }).compact().value();

  return Array.from(holesInsideInputSpan);
}
