const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackLoadVendorPlugin = require('@ocean/load-vendor-webpack-plugin');
const Config = require('../config');
const common = require('./webpack.common');

module.exports = merge(common, {
  output: {
    // 编译输出目录, 不能省略
    path: path.resolve(process.cwd(), 'public'), // 打包输出目录（必选项）
    filename: '[name].bundle.js', // 文件名称
    publicPath: `${Config.context}/`
  },
  plugins: [
    new WebpackLoadVendorPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: Config.title,
      filename: Config.html.filename,
      template: Config.html.template,
      chunks: Config.html.chunks,
      isDev: true,
      favicon: 'favicon.ico'
    })
  ],
  devtool: 'source-map',
  devServer: {
    disableHostCheck: true,
    compress: true,
    contentBase: path.resolve(process.cwd(), 'public'),
    port: 3000,
    publicPath: `${Config.context}/`,
    historyApiFallback: {
      rewrites: [
        // 多页面，则可以设置二级目录来区分
        { from: /^.*$/, to: `${Config.context}/${Config.moduleName}.html` }
      ]
    },
    proxy: {
      '/query': {
        target: 'http://alpha.local.bkjk-inc.com:8080'
      },
      '/api/ledger': {
        target: 'http://alpha.local.bkjk-inc.com:8080',
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        include: [path.resolve(process.cwd(), 'src')],
        use: 'eslint-loader'
      }
    ]
  }
});
