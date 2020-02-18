import { Metric } from 'grafana-datasource-kit';


export type AnalyticUnitId = string;
export enum AnalyticUnitStatus {
  READY = 'READY',
  PENDING = 'PENDING',
  LEARNING = 'LEARNING',
  DETECTION = 'DETECTION',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
};

export type FindManyQuery = {
  name?: string,
  grafanaUrl?: string,
  panelId?: string,
  type?: string,
  metric?: Metric,
  alert?: boolean,
  id?: AnalyticUnitId,
  lastDetectionTime?: number,
  status?: AnalyticUnitStatus,
  error?: string,
  labeledColor?: string,
  deletedColor?: string,
  detectorType?: DetectorType,
  visible?: boolean,
  collapsed?: boolean
};

export const ANALYTIC_UNIT_TYPES = {
  pattern: [
    {
      name: 'General',
      value: 'GENERAL'
    },
    {
      name: 'Peak',
      value: 'PEAK'
    },
    {
      name: 'Trough',
      value: 'TROUGH'
    },
    {
      name: 'Jump',
      value: 'JUMP'
    },
    {
      name: 'Drop',
      value: 'DROP'
    }
  ],
  anomaly: [
    {
      name: 'Confidence Snake',
      value: 'ANOMALY'
    }
  ],
  threshold: [
    {
      name: 'Threshold',
      value: 'THRESHOLD'
    }
  ]
};

export enum DetectorType {
  PATTERN = 'pattern',
  ANOMALY = 'anomaly',
  THRESHOLD = 'threshold'
};
