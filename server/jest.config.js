module.exports = {
  "verbose": true,
  "globals": {
    "ts-jest": {
      "useBabelrc": true,
      "tsConfigFile": "tsconfig.jest.json"
    },
  "GIT_VERSION": "test_version",
  "GIT_COMMITHASH": "test_commit_hash",
  "GIT_BRANCH": "test_branch"
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
