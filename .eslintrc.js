module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['server/'],
  overrides: [
    { files: ['jest.setup.js'], env: { jest: true } },
    { files: ['scripts/**/*.js'], env: { node: true } },
  ],
};
