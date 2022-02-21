import * as path from 'path'
import ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
import CompressionWebpackPlugin = require('compression-webpack-plugin')
import CopyWebpackPlugin = require('copy-webpack-plugin')
import ForkTSCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
import HtmlWebpackPlugin = require('html-webpack-plugin')
import type { Configuration } from 'webpack'
import webpack = require('webpack')
import { getPackageJson } from '../lib/utils/package'
import {
  defaultDefinePluginOption,
  isDefaultDevelopment,
  isDefaultTypeScriptProject,
  isDefaultTypeScriptFrontProject
} from './defaults'
import {
  getCSSRule,
  getImageRule,
  getLessRule,
  getScriptRule,
  getSVGRule
} from './rules'
import type { WebpackPlugins } from './types'
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WebpackBar = require('webpackbar')

const pkg = getPackageJson()

export const getCommonConfig = (
  args: Configuration & {
    isDevelopment?: boolean
    name?: string
    plugins?: WebpackPlugins
  } = {}
): Configuration => {
  const {
    isDevelopment = isDefaultDevelopment,
    name = pkg?.name || 'Webpack',
    mode = 'development',
    entry = path.resolve(process.cwd(), 'src/index'),
    output,
    plugins
  } = args

  const html = isDefaultTypeScriptFrontProject

  return {
    mode,
    entry,
    output: {
      path:
        output?.path ||
        path.resolve(process.cwd(), name ? `dist-${name}` : 'dist'),
      filename: isDevelopment
        ? 'js/[name].bundle.js'
        : 'js/[name].[contenthash:8].bundle.js',
      chunkFilename: isDevelopment
        ? 'js/[name].chunk.js'
        : 'js/[name].[contenthash:8].chunk.js',
      assetModuleFilename: 'images/[hash][ext][query]',
      publicPath: output?.publicPath || '/'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      ...args?.resolve
    },
    module: {
      rules: [
        getScriptRule(),
        getLessRule(),
        getCSSRule(),
        getSVGRule(),
        getImageRule(),
        ...(args?.module?.rules || [])
      ]
    },
    plugins: [
      // @see https://webpack.js.org/plugins/progress-plugin/
      new WebpackBar({
        name
      }),
      isDefaultTypeScriptProject &&
        new ForkTSCheckerWebpackPlugin({
          logger: 'webpack-infrastructure',
          typescript: {
            configFile: isDevelopment
              ? path.resolve(process.cwd(), 'tsconfig.json')
              : path.resolve(process.cwd(), 'tsconfig.development.json')
          }
        }),
      isDevelopment && isDefaultTypeScriptProject && new ReactRefreshPlugin(),
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
      plugins?.copy && new CopyWebpackPlugin(plugins.copy),
      /*----------------------------------------------------------------*/
      // @see https://www.npmjs.com/package/compression-webpack-plugin
      plugins?.compression &&
        new CompressionWebpackPlugin(
          typeof plugins.compression === 'object'
            ? plugins.compression
            : undefined
        )
    ].filter(Boolean) as Configuration['plugins']
  }
}
