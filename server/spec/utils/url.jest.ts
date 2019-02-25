import { normalizeUrl } from '../../src/utils/url';

describe('Normalize URL', function() {
  const cases = [
    { value: '127.0.0.1:8000', expected: 'http://127.0.0.1:8000' },
    { value: '127.0.0.1:8000/', expected: 'http://127.0.0.1:8000' },
    { value: 'localhost:8000', expected: 'http://localhost:8000' },
    { value: 'localhost:8000/', expected: 'http://localhost:8000' },
    { value: 'http://localhost:3000', expected: 'http://localhost:3000' },
    { value: 'http://localhost:3000/', expected: 'http://localhost:3000' },
    { value: 'https://localhost:8000', expected: 'https://localhost:8000' },
    { value: 'https://localhost:8000/', expected: 'https://localhost:8000' },
    { value: 'http://example.com', expected: 'http://example.com' },
    { value: 'http://example.com/', expected: 'http://example.com' },
    { value: 'https://example.com', expected: 'https://example.com' },
    { value: 'https://example.com/', expected: 'https://example.com' },
    { value: 'https://example.com/grafana', expected: 'https://example.com/grafana' },
    { value: 'https://example.com/grafana/', expected: 'https://example.com/grafana' },
  ];

  it('should normalize URLs correctly', function() {
    cases.forEach(testCase => {
      expect(normalizeUrl(testCase.value)).toBe(testCase.expected);
    });
  });
});
