import { HASTIC_PORT }  from '../src/config';

describe("When importing from .ts files", function() {

  it("should work", function() {
    expect(HASTIC_PORT).toBe(8000)
  })
})
