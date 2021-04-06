module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        useBuiltIns: 'entry',
        corejs: { version: 3, proposals: true }
      }
    ],
    '@babel/preset-react'
  ],
  env: {
    development: {
      presets: [['@babel/preset-react', { development: true }]]
    }
  },
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-unicode-property-regex',
    'babel-plugin-styled-components',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['import', { libraryName: '@ocean/utils', libraryDirectory: 'es' }]
  ]
};
