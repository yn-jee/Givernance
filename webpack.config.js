const path = require('path');

module.exports = {
  entry: './js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    fallback: {
      "fs": false,
      "path": false,
      "crypto": false,
      "stream": false,
      "assert": false,
      "util": false,
      "http": false,
      "https": false,
      "os": false,
      "url": false,
      "zlib": false,
    }
  }
};
