module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'addsearch-js-client.js',
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
            presets: ['es2015']
          }
        }
      }
    ]
  }
};
