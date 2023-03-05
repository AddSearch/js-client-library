const webpack = require('webpack');
const PACKAGE = require('./package.json');
const banner = PACKAGE.name + ' ' + PACKAGE.version;
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = [
  {
    entry: './src/index.js',
    output: {
      filename: 'addsearch-js-client.min.js',
      // library: 'AddSearchClient',
      libraryExport: 'default',
      libraryTarget: 'umd',
      globalObject: 'this',
      library: {
        name: 'AddSearchClient',
        type: 'module'
      }
      // libraryTarget: 'global',
      // globalObject: 'this'
    },
    target: 'web',
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
              // plugins: ["transform-es2015-modules-commonjs"]
            }
          }
        }
      ]
    }
  }, {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'lib/cjs'),
      filename: 'addsearch-js-client.min.cjs',
      // library: 'AddSearchClient',
      libraryTarget: 'commonjs2',
      globalObject: 'this',
      libraryExport: 'default',

      // libraryTarget: 'global',
      // globalObject: 'this'
    },
    target: 'node',
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
        buffer: require.resolve('buffer/'),
      },
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          test: /\.(js|mjs)$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  // { modules: 'commonjs' }
                ]
              ],
              // plugins: ["transform-es2015-modules-commonjs"]
            }
          }
        }
      ]
    }
  }
];
