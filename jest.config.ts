module.exports = {
  rootDir: '.',
  displayName: '@samatech/vue3-eth',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/lib/**/+(*.)+(spec).+(ts)', '**/test/**/+(*.)+(spec).+(ts)'],
  resetMocks: false,
}
