var nodeExternals = require('webpack-node-externals')
const path = require('path');

module.exports = {
   mode: "production",
   entry: './handler.js',
   target: 'node',
   // externals: [nodeExternals()],
   output: {
      libraryTarget: 'commonjs',
      path: path.resolve(__dirname, '.webpack'),
      filename: 'handler.js', // this should match the first part of function handler in serverless.yml
   },
   module: {
      rules: [
         {
            test: /\.jsx?$/,
            exclude:  path.resolve(__dirname, "node_modules"),
            loader: ["babel-loader"]
         }
      ]
   }
};
