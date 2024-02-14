'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const paths = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: paths.src + '/popup.ts',
      contentScript: paths.src + '/contentScript.ts',
      background: paths.src + '/background.ts',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      alias: {
        '@': paths.src,
      },
      modules: [paths.src, 'node_modules'],
      extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
