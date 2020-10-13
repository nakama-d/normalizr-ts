module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ["jest-extended"],
  rootDir: __dirname,
  globals: {
    "ts-jest": {
      "tsConfig": "tsconfig.json",
      "ciagnostics": true
    },    
    __DEV__: true,
    __BROWSER__: true,
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'src/index.ts', 'src/entries'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  testEnvironment: 'node',
  moduleNameMapper: {
    "lodash-es": "lodash",
    '^@/(.*)$': '<rootDir>/src/$1',
    '^test/(.*)$': '<rootDir>/__tests__/$1'
  },
  moduleFileExtensions: [
    "tsx",
    "ts",
    "js",
    "jsx",
    "json",
    "node"    
  ],
  moduleDirectories: ["node_modules", "src"],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest'
  },
  automock: false,
}