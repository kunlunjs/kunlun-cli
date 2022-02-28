import { existsSync } from 'fs'
import * as path from 'path'
import type { Configuration } from 'webpack'
import { getPackageJson } from '../lib/utils/package'
import {
  defaultDefinePluginOption,
  isDefaultTSProject,
  isDefaultTSFrontProject,
  paths
} from './defaults'
import {
  getCSSLoader,
  getLessLoader,
  getImageLoader,
  getBabelLoader,
  getSVGLoader,
  getLessModuleLoader,
  getCSSModuleLoader
} from './loaders'
import { getAvifLoader } from './loaders/avif.loader'
import { getSassLoader, getSassModuleLoader } from './loaders/sass.loader'
import type { WebpackPlugins } from './types'
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ForkTSCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const WebpackBar = require('webpackbar')

const pkg = getPackageJson()

export const getCommonConfig = (
  args: Configuration & {
    name?: string
    plugins?: WebpackPlugins
  } = {}
): Configuration => {
  const {
    name = pkg?.name || 'Webpack',
    mode = 'development',
    entry = path.resolve(paths.root, 'src/index'),
    output,
    plugins
  } = args

  const isEnvDevelopment = mode === 'development'
  const isEnvProduction = mode === 'production'
  const useSourceMap = isEnvDevelopment
  const html = isDefaultTSFrontProject

  const projectDevelopmentTSFile = path.resolve(
    paths.root,
    'tsconfig.development.json'
  )
  const projectProductionTSFile = path.resolve(paths.root, 'tsconfig.json')
  const defaultDevelopmentTSFile = path.resolve(
    __dirname,
    'tsconfig.development.json'
  )
  const defaultProductionTSFile = path.resolve(
    __dirname,
    'tsconfig.production.json'
  )

  const tsconfigFile = isEnvDevelopment
    ? existsSync(projectDevelopmentTSFile)
      ? projectDevelopmentTSFile
      : existsSync(projectProductionTSFile)
      ? projectProductionTSFile
      : defaultDevelopmentTSFile
    : existsSync(projectProductionTSFile)
    ? projectProductionTSFile
    : defaultProductionTSFile

  return {
    bail: !isEnvDevelopment,
    mode,
    entry,
    output: {
      pathinfo: isEnvDevelopment,
      path: output?.path || path.resolve(paths.root, 'dist'), // path.resolve(paths.root, name ? `dist-${name}` : 'dist'),
      filename:
        mode === 'development'
          ? 'static/js/[name].bundle.js'
          : 'static/js/[name].[contenthash:8].bundle.js',
      chunkFilename: isEnvDevelopment
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[contenthash:8].chunk.js',
      // assetModuleFilename: 'images/[hash][ext][query]',
      publicPath: output?.publicPath || '/'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(paths.root, 'src'),
        'src': path.resolve(paths.root, 'src')
      },
      ...args?.resolve
    },
    module: {
      rules: [
        getBabelLoader({ isEnvDevelopment }),
        getAvifLoader(),
        getCSSLoader({ isEnvDevelopment, useSourceMap }),
        getCSSModuleLoader({ isEnvDevelopment, useSourceMap }),
        getLessLoader({ isEnvDevelopment, useSourceMap }),
        getLessModuleLoader({ isEnvDevelopment, useSourceMap }),
        getSassLoader({ isEnvDevelopment, useSourceMap }),
        getSassModuleLoader({ isEnvDevelopment, useSourceMap }),
        getSVGLoader(),
        getImageLoader(),
        ...(args?.module?.rules || [])
      ]
    },
    plugins: [
      // @see https://webpack.js.org/plugins/progress-plugin/
      new WebpackBar({
        name
      }),
      isDefaultTSProject &&
        new ForkTSCheckerWebpackPlugin({
          logger: 'webpack-infrastructure',
          typescript: {
            context: paths.root,
            configFile: tsconfigFile
          }
        }),
      isEnvDevelopment && isDefaultTSProject && new ReactRefreshPlugin(),
      /*----------------------------------------------------------------*/
      plugins?.case &&
        CaseSensitivePathsPlugin(
          typeof plugins.case === 'object' ? plugins.case : {}
        ),
      /*----------------------------------------------------------------*/
      plugins?.banner &&
        new webpack.BannerPlugin(
          typeof plugins.banner === 'string'
            ? {
                banner: plugins.banner
              }
            : plugins.banner
        ),
      /*----------------------------------------------------------------*/
      (plugins?.html || html) &&
        !Array.isArray(plugins?.html) &&
        new HtmlWebpackPlugin(
          typeof plugins?.html === 'object'
            ? plugins.html
            : {
                title: name,
                inject: 'body',
                template: path.resolve(__dirname, './template.html')
              }
        ),
      ...(Array.isArray(plugins?.html)
        ? plugins!.html.map(option => new HtmlWebpackPlugin(option))
        : []),
      /*----------------------------------------------------------------*/
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
        }),
      /*----------------------------------------------------------------*/
      // @see https://webpack.js.org/plugins/define-plugin/
      plugins?.define &&
        new webpack.DefinePlugin(
          typeof plugins.define === 'boolean'
            ? defaultDefinePluginOption
            : {
                defaultDefinePluginOption,
                ...plugins.define
              }
        ),
      /*----------------------------------------------------------------*/
      // @see https://github.com/johnagan/clean-webpack-plugin
      plugins?.clean &&
        new CleanWebpackPlugin(plugins.clean !== true ? plugins.clean : {}),
      /*----------------------------------------------------------------*/
      // @see https://webpack.js.org/plugins/copy-webpack-plugin/
      plugins?.copy && new CopyWebpackPlugin(plugins.copy)
    ].filter(Boolean) as Configuration['plugins']
  }
}
