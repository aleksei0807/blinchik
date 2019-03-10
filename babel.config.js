const config = {
  presets: [
    [
      '@babel/preset-env', {
        targets: {
          browsers: [
            'last 2 versions',
            'Safari >= 9',
            'IE >= 11',
            'last 2 iOS major versions',
          ],
          node: 'current',
        },
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-export-default-from',
    [ '@babel/plugin-proposal-decorators', { legacy: true } ],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
}


module.exports = config
