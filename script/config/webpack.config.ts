import webpack from 'webpack'
import TsConfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import paths from './paths'


export default {
  entry: {
    [paths.appMainName]: paths.appMainPath,
    [paths.appBinName]: paths.appBinPath,
  },
  output: {
    path: paths.appTarget,
    filename: '[name].js',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: '(typeof self !== \'undefined\' ? self : this)',
  },
  resolve: {
    modules: [paths.appNodeModules],
    extensions: ['.js', '.ts', '.json'],
    plugins: [
      new TsConfigPathsPlugin({ configFile: paths.appTsConfig }),
    ],
    alias: {
      '@': paths.appSrc,
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|mjs|ts|tsx)$/,
        loader: 'babel-loader',
        include: [paths.appSrc]
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: '#! /usr/bin/env node',
      raw: true,
      entryOnly: true,
      include: [paths.appBinName]
    }),
  ],
  context: paths.appSrc,
  node: {
    __filename: true,
    __dirname: true,
  },
  mode: 'production',
  target: 'node',
  externals: paths.appExternals,
} as webpack.Configuration
