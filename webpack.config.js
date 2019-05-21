module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'addsearch-js-client.min.js',
    library: 'AddSearchClient',
    libraryTarget: 'global'
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
            presets: ['babel-preset-es2015']
          }
        }
      }
    ]
  }
};
