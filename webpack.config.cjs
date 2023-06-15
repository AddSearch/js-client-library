const webpack = require('webpack');
const PACKAGE = require('./package.json');
const banner = PACKAGE.name + ' ' + PACKAGE.version;
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');

const commonConfig = {
  entry: './src/index.js',
  plugins: [
    new ESLintPlugin(),
    new webpack.BannerPlugin({
      banner: banner
    })
  ],
  mode: 'production',
  optimization: {
    minimizer: [new TerserJSPlugin({
      extractComments: false,
      terserOptions: {
        format: {
          comments: /addsearch-js-client/i,
        }
      },
    })]
  },
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/')
    },
  },
  module: {
    rules: [
      {
        test: /\.js|mjs$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {'targets': '> 0.1%, IE 10, not dead'}
              ]
            ],
          }
        }
      }
    ]
  }
};

module.exports = [
  Object.assign({
    output: {
      filename: 'addsearch-js-client.min.js',
      libraryExport: 'default',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: {
        name: 'AddSearchClient',
        type: 'module'
      }
    },
    target: 'web'
  }, commonConfig),
  Object.assign({
    output: {
      path: path.resolve(__dirname, 'lib/cjs'),
      filename: 'addsearch-js-client.min.cjs',
      libraryTarget: 'commonjs2',
      globalObject: 'this',
      libraryExport: 'default',
    },
    target: 'node'
  }, commonConfig)
];
