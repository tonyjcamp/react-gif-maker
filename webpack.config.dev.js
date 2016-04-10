var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/public/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        loader: 'babel',
        test: /\.(js|jsx|babel)$/,
        include: path.join(__dirname, 'src'),
        exclude: path.join(__dirname, 'node_modules')
      },
      {
        test:   /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },

  postcss() {
    return [require('autoprefixer'), require('precss')]
  },

  node: {
      console: true,
      fs: 'empty',
      net: 'empty',
      tls: 'empty'
    }

};
