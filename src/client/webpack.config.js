const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || "development",
  devtool: "source-map",
  entry: './src/client/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../build/client')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  }
};
