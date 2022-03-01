import { existsSync } from 'fs'
import * as path from 'path'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import type { Configuration, RuleSetRule } from 'webpack'
import WindCSSPlugin from 'windicss-webpack-plugin'
import { getPackageJson } from '../lib/utils/package'
import {
  defaultDefinePluginOption,
  isDefaultTSProject,
  isDefaultTSFrontProject,
  paths,
  isExistWindiCSS
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
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
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
  const { BUNDLE_ANALYZER } = process.env
  const isEnvDevelopment = mode === 'development'
  const isEnvProduction = mode === 'production'
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile')

  const caseSensitivePaths = plugins?.case || true
  const copy = plugins?.copy
  const banner = plugins?.banner
  const clean = plugins?.define || true
  const define = plugins?.define || true

  const useSourceMap =
    process.env.GENERATE_SOURCEMAP == 'true' || isEnvDevelopment
  const html = plugins?.html || isDefaultTSFrontProject

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
    devtool: isEnvProduction
      ? useSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
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
        'src': path.resolve(paths.root, 'src'),
        ...(isEnvProductionProfile && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling'
        })
      },
      plugins: [
        new TsconfigPathsPlugin({
          silent: true,
          baseUrl: paths.root,
          configFile: tsconfigFile,
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs']
        })
      ],
      fallback: {
        fs: false,
        path: false,
        buffer: false,
        assert: false
      },
      ...args?.resolve
    },
    // externalsPresets: { node: true },
    // externals: [nodeExternals()],
    module: {
      strictExportPresence: true,
      rules: [
        // useSourceMap && {
        //   enforce: 'pre',
        //   exclude: /@babel(?:\/|\\{1,2})runtime/,
        //   test: /\.(js|mjs|jsx|ts|tsx|css)$/,
        //   loader: require.resolve('source-map-loader')
        // },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            getBabelLoader({ isEnvDevelopment }),
            getAvifLoader(),
            getCSSLoader({ isEnvDevelopment, useSourceMap }),
            getCSSModuleLoader({ isEnvDevelopment, useSourceMap }),
            getLessLoader({ isEnvDevelopment, useSourceMap }),
            getLessModuleLoader({ isEnvDevelopment, useSourceMap }),
            getSassLoader({ isEnvDevelopment, useSourceMap }),
            getSassModuleLoader({ isEnvDevelopment, useSourceMap }),
            getSVGLoader(),
            getImageLoader()
          ]
        },
        ...(args?.module?.rules || [])
      ].filter(Boolean) as RuleSetRule[]
    },
    plugins: [
      // @see https://webpack.js.org/plugins/progress-plugin/
      new WebpackBar({
        name
      }),
      /*----------------------------------------------------------------*/
      // @see https://github.com/johnagan/clean-webpack-plugin
      clean && new CleanWebpackPlugin(clean !== true ? clean : {}),
      /*----------------------------------------------------------------*/
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
      caseSensitivePaths &&
        new CaseSensitivePathsPlugin(
          typeof caseSensitivePaths === 'object' ? caseSensitivePaths : {}
        ),
      /*----------------------------------------------------------------*/
      banner &&
        new webpack.BannerPlugin(
          typeof banner === 'string'
            ? {
                banner
              }
            : banner
        ),
      /*----------------------------------------------------------------*/
      html &&
        !Array.isArray(html) &&
        new HtmlWebpackPlugin(
          typeof html === 'object'
            ? html
            : {
                title: name,
                inject: 'body',
                template: path.resolve(__dirname, './template.html')
              }
        ),
      ...(Array.isArray(html)
        ? html.map(option => new HtmlWebpackPlugin(option))
        : []),
      /*----------------------------------------------------------------*/
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: true
        }),
      /*----------------------------------------------------------------*/
      // @see https://webpack.js.org/plugins/define-plugin/
      define &&
        new webpack.DefinePlugin(
          typeof define === 'boolean'
            ? defaultDefinePluginOption
            : {
                defaultDefinePluginOption,
                ...define
              }
        ),
      /*----------------------------------------------------------------*/
      // @see https://webpack.js.org/plugins/copy-webpack-plugin/
      copy && new CopyWebpackPlugin(copy),
      /*----------------------------------------------------------------*/
      isExistWindiCSS && new WindCSSPlugin(),
      /*----------------------------------------------------------------*/
      BUNDLE_ANALYZER === 'true' && new BundleAnalyzerPlugin()
    ].filter(Boolean) as Configuration['plugins'],
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 20480,
        maxInitialRequests: 10,
        maxAsyncRequests: 10,
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: 'vendors',
            priority: -10,
            enforce: true,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: (entryPoint: { name: string }) => `runtime-${entryPoint.name}`
      }
    },
    performance: {
      maxAssetSize: 650 * 1024,
      maxEntrypointSize: 650 * 1024
    },
    experiments: {
      topLevelAwait: true
    }
  }
}
