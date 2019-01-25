console.log = jest.fn();
console.error = jest.fn();

jest.mock('../src/config.ts', () => ({
  HASTIC_API_KEY: 'fake-key',
  DATA_PATH: 'fake-data-path',
  ZMQ_IPC_PATH: 'fake-zmq-path'
}));
