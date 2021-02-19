const path = require('path');
const merge = require('webpack-merge');
const fs = require('fs-extra');
const TerserPlugin = require('terser-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const common = require('./webpack.common');
const Config = require('../config');

const appPath = path.resolve(process.cwd(), 'public');

const outputPath = path.join(appPath, 'dist');

fs.removeSync(outputPath);

module.exports = merge(common, {
  output: {
    path: outputPath,
    filename: '[name].[chunkhash].js',
    publicPath: '/dist/'
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.(c|le)ss$/g
    }),
    new ManifestPlugin({
      fileName: 'mapping.json',
      publicPath: `${Config.pathInMappingJson}`,
      seed: {
        title: Config.title
      }
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      })
    ]
  }
});
