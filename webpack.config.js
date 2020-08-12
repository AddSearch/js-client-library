const webpack = require('webpack');
const PACKAGE = require('./package.json');
const banner = PACKAGE.name + ' ' + PACKAGE.version;

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'addsearch-js-client.min.js',
    library: 'AddSearchClient',
    libraryTarget: 'global'
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: banner
    })
  ],
  node: {
    Buffer: false
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
              '@babel/preset-env',
                {'targets': '> 0.1%, IE 10, not dead'}
              ]
            ]
          }
        }
      }
    ]
  }
};
