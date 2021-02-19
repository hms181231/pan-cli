/**
 "off" or 0 - turn the rule off
 "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code)
 "error" or 2 - turn the rule on as an error (exit code is 1 when triggered)
 **/

module.exports = {
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-shadow': 0,
    'no-param-reassign': 0,
    'no-unused-expressions': 0,
    'no-restricted-syntax': 0,
    'prefer-const': 0,
    'no-plusplus': 0,
    'react/jsx-curly-newline': 0,
    'react/state-in-constructor': 0,
    'react/jsx-props-no-spreading': 0,
    'consistent-return': 0,
    'import/order': 0,
    'react/sort-comp': 0,
    'react/static-property-placement': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'jsx-a11y/label-has-for': 0,
    'import/no-extraneous-dependencies': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/require-default-props': 0,
    'react/forbid-prop-types': 0,
    'no-console': 0, // 是否允许 console
    'no-debugger': 0, // 是否允许使用 debugger
    'react/display-name': 0,
    'react/no-multi-comp': 0,
    'jsx-a11y/media-has-caption': 0
  },
  parser: 'babel-eslint', // 指定默认解析器
  env: {
    es6: true,
    node: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true // enable JSX
    }
  },
  globals: {
    // 定义全局的变量
  },
  extends: [
    // 推荐使用默认配置好的
    'airbnb',
    'airbnb/hooks',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    //定义第三方插件
    'babel'
  ],
  settings: {
    // 设置
    'import/resolver': {
      webpack: {
        config: './build/webpack.config.js' // 读取 webpack 的别名配置
      }
    },
    react: {
      pragma: 'React',
      version: 'detect'
    }
  },
  root: true // 设置他后，子的js文件找到该 eslint配置文件后，则不再向上查找其他eslint配置文件
};
