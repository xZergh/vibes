module.exports = {
  testEnvironment: 'node',
  testTimeout: 10000,
  verbose: true,
  collectCoverageFrom: [
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/'],
  // setupFilesAfterEnv: ['./jest.setup.js']
};