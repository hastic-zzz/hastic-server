module.exports = {
  "verbose": true,
  "globals": {
    "ts-jest": {
      "useBabelrc": true,
      "tsConfigFile": "tsconfig.jest.json"
    },
    "GIT_VERSION": "version",
    "GIT_COMMITHASH": "commit_hash",
    "GIT_BRANCH": "branch"
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
