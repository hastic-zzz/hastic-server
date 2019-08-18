//TODO: move this code to span model

import * as _ from 'lodash';


export declare type Segment = {
  readonly from: number,
  readonly to: number
}


export class IntegerSegment {
  readonly from: number;
  readonly to: number;

  constructor(from: number, to: number) {
    if((Number.isInteger(from) || !Number.isFinite(from))) {
      throw new Error(`From should be an Integer or Infinity, but got ${from}`);
    }
    if((Number.isInteger(to) || !Number.isFinite(to))) {
      throw new Error(`To should be an Integer or Infinity, but got ${from}`);
    }

    let l = IntegerSegment.lengthBetweenPoints(from, to);
    if(l < 1) {
      throw new Error(
        `Length of segment is less than 1: [${from}, ${to}]. 
        It's not possible for IntegerSegment`
      );
    }
    this.from = from;
    this.to = to;
  }

  get length(): number {
    return IntegerSegment.lengthBetweenPoints(this.from, this.to);
  }

  insersect(segment: IntegerSegment): IntegerSegment | undefined {
    let from = Math.max(this.from, segment.from);
    let to = Math.min(this.to, segment.to);
    if(IntegerSegment.lengthBetweenPoints(from, to) >= 1) {
      return new IntegerSegment(from, to);
    }
    return undefined;
  }

  toString(): string {
    return `[${this.from}, ${this.to}]`;
  }

  static lengthBetweenPoints(from: number, to: number): number {
    let l = to - from + 1; // because [x, x] has length 1
    if(isNaN(l)) { // when [Infinity, Infinity] or [-Infinity, -Infinity]
      return 0;
    } else {
      return Math.max(l, 0); // becase [x, x - 1] we consider as zero length
    }
  }
}

export class IntegerSegmentsSet {

  private _segments: IntegerSegment[];

  constructor(segments: IntegerSegment[], noramlized: boolean = false) {
    this._segments = segments;
    if(noramlized !== true) {
      this._normalize();
    }
  }

  private _normalize() {
    let sortedSegments = _.sortBy(this._segments, s => s.from);
    let lastFrom = this._segments[0].from;
    let lastTo = this._segments[0].to;
    let mergedSegments: IntegerSegment[] = [];
    for(let i = 1; i < sortedSegments.length; i++) {
      let currentSegment = mergedSegments[i];
      if(lastTo + 1 >= currentSegment.from) { // because [a, x], [x + 1, b] is [a, b]
        lastTo = currentSegment.to;
        continue;
      }
      mergedSegments.push(new IntegerSegment(lastFrom, lastTo));
      lastFrom = currentSegment.from;
      lastTo = currentSegment.to;
    }
    mergedSegments.push(new IntegerSegment(lastFrom, lastTo));
    this._segments = mergedSegments;
  }

  get segments(): readonly IntegerSegment[] {
    return this._segments;
  }

  inversed(): IntegerSegmentsSet {
    var invertedSegments: IntegerSegment[] = [];
    if(this._segments.length === 0) {
      invertedSegments = [new IntegerSegment(-Infinity, Infinity)];
    } else {
      let push = (f: number, t: number) => {
        if(IntegerSegment.lengthBetweenPoints(f, t) > 0) {
          invertedSegments.push(new IntegerSegment(f, t));
        }
      }
      _.reduce(this._segments, (prev: IntegerSegment | null, s: IntegerSegment) => {
        if(prev === null) {
          push(-Infinity, s.from)
        } else {
          push(prev.to + 1, s.from - 1)
        }
        return s;
      }, null);
      push(_.last(this._segments).to + 1, Infinity);
    }
    return new IntegerSegmentsSet(invertedSegments, true);
  }

  intersected(other: IntegerSegmentsSet): IntegerSegmentsSet {
    let result: IntegerSegment[] = [];

    let currentSegmentIndex = 0;
    let withSegmentIndex = 0;

    do {
      let currentSegemet = this.segments[currentSegmentIndex];
      let withSegment = this.segments[withSegmentIndex];
      if(currentSegemet.to < withSegment.from) {
        currentSegmentIndex++;
        continue;
      }
      if(withSegment.to < currentSegemet.from) {
        withSegmentIndex++;
        continue;
      }
      let segmentsIntersection = currentSegemet.insersect(withSegment);
      if(segmentsIntersection === undefined) {
        throw new Error(
          `Impossible condition, segments ${currentSegemet} and ${withSegment} don't interset`
        )
      }
      result.push(segmentsIntersection);
    } while(
      currentSegmentIndex <= this._segments.length &&
      withSegmentIndex <= other.segments.length
    )

    return new IntegerSegmentsSet(result, true);
  }

  sub(other: IntegerSegmentsSet): IntegerSegmentsSet {
    let inversed = other.inversed();
    return this.intersected(inversed);
  }

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
  let setA = new IntegerSegmentsSet([new IntegerSegment(inputSegment.from, inputSegment.to)]);
  let setB = new IntegerSegmentsSet(cutSegments.map(
    s => new IntegerSegment(s.from, s.to)
  ));
  let setResult = setA.sub(setB);
  return setResult.segments.map(s => ({ from: s.from, to: s.to }));
}
