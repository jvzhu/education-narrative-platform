module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts']
};
