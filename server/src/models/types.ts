export type SerializedSegment = {
  analyticUnitId: string,
  from: number,
  to: number,
  labeled: boolean,
  deleted: boolean,
  id?: string,
  message?: string
};

export type SerializedDetectionSpan = {
  analyticUnitId: string,
  from: number,
  to: number,
  status: string,
  id?: string
};

export type SerializedCache = {
  id: string,
  data?: AnomalyData | PatternData | ThresholdData
};

export type AnomalyData = {
  alpha: number,
  confidence: number,
  enableBounds: string,
  timeStep: number,
  segments: AnomalySegment[]
};

export type ThresholdData = {
  value: number,
  condition: string,
  timeStep: number
};

export type PatternData = GeneralPatternData & Partial<ModelData>;

export type AnomalySegment = {
  from: number,
  to: number,
  data: number[]
};

export type GeneralPatternData = {
  timeStep: number,
  patternCenter: number[],
  patternModel: number[],
  convolveMax: number,
  convolveMin: number,
  windowSize: number,
  convDelMin: number,
  convDelMax: number
};

export type ModelData = { confidence: number } & (TriangleData | JumpData | DropData);

export type TriangleData = {
  heightMax: number,
  heightMin: number
};

export type JumpData = {
  jumpHeight: number,
  jumpLength: number
};

export type DropData = {
  dropHeight: number,
  dropLength: number
};
