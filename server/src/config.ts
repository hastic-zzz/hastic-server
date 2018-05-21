import * as path from 'path';

const DATA_PATH = path.join(__dirname, '../data');
const ANALYTICS_PATH = path.join(__dirname, '../../src');
const ANOMALIES_PATH = path.join(ANALYTICS_PATH, 'anomalies');
const SEGMENTS_PATH = path.join(ANALYTICS_PATH, 'segments');
const METRICS_PATH = path.join(ANALYTICS_PATH, 'metrics');

export { DATA_PATH, ANALYTICS_PATH, ANOMALIES_PATH, SEGMENTS_PATH, METRICS_PATH }
