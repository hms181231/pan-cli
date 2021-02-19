const path = require('path');
const WebpackBar = require('webpackbar');
const fs = require('fs');
const lessToJs = require('less-vars-to-js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Config = require('../config');

const isDev = () => {
  return process.env.NODE_ENV === 'development';
};

const antDefaultVarsPath = path.join(
  process.cwd(),
  'src/style/ant-default-vars.less'
);

const themeVariables = lessToJs(fs.readFileSync(antDefaultVarsPath, 'utf8'));

module.exports = {
  entry: {
    [`${Config.moduleName}`]: [path.resolve(process.cwd(), 'src/index.jsx')]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.less', '.png', '.jpg', '.gif'],
    modules: ['src', 'node_modules'],
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      component: path.resolve(process.cwd(), 'src/component'),
      service: path.resolve(process.cwd(), 'src/service'),
      constant: path.resolve(process.cwd(), 'src/constant'),
      container: path.resolve(process.cwd(), 'src/container'),
      utils: path.resolve(process.cwd(), 'src/utils')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [path.resolve(process.cwd(), 'src')],
        use: 'babel-loader?cacheDirectory'
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[hash].[ext]',
            limit: 100000 // 10kb
          }
        }
      },
      {
        test: /\.(mp4|ogg|eot|woff|ttf|svg|woff2)$/,
        use: 'file-loader'
      },
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              modifyVars: themeVariables
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new WebpackBar({
      name: `📦 ${Config.moduleName}`
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : 'css/style.[name].[chunkhash].css',
      chunkFilename: isDev ? '[id].css' : '[id].[hash].css'
    })
  ]
};
