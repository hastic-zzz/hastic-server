import { createTestDB } from './utils_for_tests/analytic_units';
import { clearSegmentsDB } from './utils_for_tests/segments';

console.log = jest.fn();
console.error = jest.fn();

jest.mock('../src/config.ts', () => ({
  DATA_PATH: 'fake-data-path',
  HASTIC_API_KEY: 'fake-key',
  ZMQ_IPC_PATH: 'fake-zmq-path',
  HASTIC_DB_CONNECTION_TYPE: 'nedb',
  HASTIC_IN_MEMORY_PERSISTANCE: true,
  HASTIC_ALERT_TYPE: 'webhook',
  AlertTypes: jest.requireActual('../src/config').AlertTypes,
}));

jest.mock('deasync', () => ({ loopWhile: jest.fn() }));

clearSegmentsDB();
createTestDB();
