export type SerializedSegment = {
  analyticUnitId: string,
  from: number,
  to: number,
  labeled: boolean,
  deleted: boolean,
  id: string,
  message: string
}

export type SerializedCache = {
  id: string,
  data: {
    alpha: number,
    confidence: number,
    enableBounds: string,
    timeStep: number,
    segments: SerializedSegment[]
  }
}

export type DetectionSpan = {
  analyticUnitId: string,
  from: number,
  to: number,
  status: string,
  id: string
}
