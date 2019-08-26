module.exports = {
  "verbose": true,
  "globals": {
    "ts-jest": {
      "useBabelrc": true,
      "tsConfigFile": "tsconfig.jest.json"
    }
  },
  "transform": {
    "\\.ts": "ts-jest"
  },
  "testRegex": "(\\.|/)([jt]est)\\.[jt]s$",
  "moduleFileExtensions": [
    "ts",
    "js",
    "json"
  ],
  "setupFiles": [
    "<rootDir>/spec/setup_tests.ts"
  ]
};

process.env.HASTIC_IN_MEMORY_PERSISTANCE = 'true';
