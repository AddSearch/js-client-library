const webpack = require('webpack');
const PACKAGE = require('./package.json');
const banner = PACKAGE.name + ' ' + PACKAGE.version;
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'addsearch-js-client.min.js',
    library: 'AddSearchClient',
    libraryTarget: 'global'
  },
  plugins: [
    new ESLintPlugin(),
    new webpack.BannerPlugin({
      banner: banner
    })
  ],
  mode: 'production',
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: /addsearch-js-client/i
          }
        }
      })
    ]
  },
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/')
    },
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: '> 0.1%, IE 10, not dead' }],
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
};
