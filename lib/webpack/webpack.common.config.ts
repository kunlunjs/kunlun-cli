import events from 'events'
import { existsSync, realpathSync } from 'fs'
import path, { resolve } from 'path'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import Dotenv from 'dotenv-webpack'
import ForkTSCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import InlineChunkHtmlPlugin from 'inline-chunk-html-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import type { Configuration, RuleSetRule } from 'webpack'
import webpack from 'webpack'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'
import WebpackBar from 'webpackbar'
import WindCSSPlugin from 'windicss-webpack-plugin'
import { isEmptyDir } from '../utils/is-empty-dir'
import { getPackageJson } from '../utils/package'
import { isExist } from '../utils/path-exists'
import {
  isTypeScriptProject,
  isTypeScriptFrontProject,
  paths,
  isExistWindiCSS,
  extensions,
  defaultStats,
  defaultProductionStats
} from './defaults'
import { defaultDefinePluginOption } from './helpers'
import {
  getBabelLoader,
  getAvifLoader,
  getSVGLoader,
  getImageLoader,
  getCSSLoader,
  getLessLoader,
  getCSSModuleLoader,
  getLessModuleLoader,
  getSassLoader,
  getSassModuleLoader,
  getJson5Loader,
  getHtmlLoader,
  getAssetLoader,
  getRawLoader,
  getMdxLoader
} from './loaders'
import type { WebpackConfig } from './types'

events.EventEmitter.defaultMaxListeners = 0

const pkg = getPackageJson()

export const getCommonConfig = (
  args: WebpackConfig & {
    mode?: 'development' | 'production'
  } = {}
): Configuration => {
  const {
    engine,
    mode = 'development',
    tsconfigFile: tsconfigPath,
    name = pkg?.name || 'Webpack',
    entry = resolve(paths.root, 'src/index'),
    output,
    plugins,
    loaders,
    devServer,
    ...rest
  } = args
  const { BUNDLE_ANALYZER } = process.env
  const isEnvDevelopment = mode === 'development'
  const isEnvProduction = mode === 'production'
  const isEnvProductionProfile =
    isEnvProduction && process.argv.includes('--profile')

  const swc = loaders?.swc

  const banner = plugins?.banner ?? name
  const env = plugins?.env ?? true
  const bar = plugins?.bar ?? true
  const copy = plugins?.copy
  const clean = plugins?.define ?? true
  const define = plugins?.define ?? true
  const ignore = plugins?.ignore ?? true
  const manifest = plugins?.manifest ?? true
  const bundleAnalyzer = plugins?.bundleAnalyzer
  const inlineChunkHtml = plugins?.inlineChunkHtml
  const caseSensitivePaths = plugins?.caseSensitvePaths ?? true

  const useSourceMap =
    process.env.GENERATE_SOURCEMAP == 'true' ?? isEnvDevelopment
  const html = plugins?.html ?? isTypeScriptFrontProject

  const projectDevelopmentTSFile = resolve(
    paths.root,
    'tsconfig.development.json'
  )
  const projectProductionTSFile = resolve(paths.root, 'tsconfig.json')
  const defaultDevelopmentTSFile = resolve(
    __dirname,
    'tsconfig.development.json'
  )
  const defaultProductionTSFile = resolve(__dirname, 'tsconfig.production.json')

  const tsconfigFile = isEnvDevelopment
    ? existsSync(projectDevelopmentTSFile)
      ? projectDevelopmentTSFile
      : existsSync(projectProductionTSFile)
      ? projectProductionTSFile
      : defaultDevelopmentTSFile
    : existsSync(projectProductionTSFile)
    ? projectProductionTSFile
    : defaultProductionTSFile

  const indexHtml = resolve(paths.root, 'src/index.cjs')
  return {
    context: realpathSync(process.cwd()),
    ...rest,
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
      path: output?.path || resolve(paths.root, 'dist'), // resolve(paths.root, name ? `dist-${name}` : 'dist'),
      filename:
        output?.filename ||
        (mode === 'development'
          ? 'static/js/[name].bundle.js'
          : 'static/js/[name].[contenthash:8].bundle.js'),
      chunkFilename:
        output?.chunkFilename ||
        (isEnvDevelopment
          ? 'static/js/[name].chunk.js'
          : 'static/js/[name].[contenthash:8].chunk.js'),
      // assetModuleFilename: 'images/[hash][ext][query]',
      publicPath: output?.publicPath || paths.publicUrlOrPath,
      devtoolFallbackModuleFilenameTemplate: isEnvProduction
        ? (info: { absoluteResourcePath: string }) =>
            path
              .relative(paths.src, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : (info: { absoluteResourcePath: string }) =>
            resolve(info.absoluteResourcePath).replace(/\\/g, '/')
    },
    resolve: {
      extensions,
      alias: {
        '@': resolve(paths.root, 'src'),
        'src': resolve(paths.root, 'src'),
        ...(isEnvProductionProfile && {
          'react-dom$': 'react-dom/profiling',
          'scheduler/tracing': 'scheduler/tracing-profiling'
        })
      },
      plugins: [
        new TsconfigPathsPlugin({
          baseUrl: paths.root,
          configFile: tsconfigFile,
          extensions
        })
      ],
      // https://webpack.js.org/configuration/resolve/#resolvefallback
      fallback: {
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        console: require.resolve('console-browserify'),
        constants: require.resolve('constants-browserify'),
        crypto: require.resolve('crypto-browserify'),
        domain: require.resolve('domain-browser'),
        events: require.resolve('events'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        punycode: require.resolve('punycode'),
        process: require.resolve('process/browser'),
        querystring: require.resolve('querystring-es3'),
        stream: require.resolve('stream-browserify'),
        string_decoder: require.resolve('string_decoder'),
        sys: require.resolve('util'),
        timers: require.resolve('timers-browserify'),
        tty: require.resolve('tty-browserify'),
        url: require.resolve('url'),
        util: require.resolve('util/'),
        vm: require.resolve('vm-browserify'),
        zlib: require.resolve('browserify-zlib')
      },
      // modules: [resolve(process.cwd(), 'node_modules'), 'node_modules'],
      ...args?.resolve
    },
    module: {
      strictExportPresence: true,
      ...args.module,
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
            getRawLoader(),
            getBabelLoader({ isEnvDevelopment }),
            // TODO
            // swc ? getSWCLoader() : getBabelLoader({ isEnvDevelopment }),
            // getVueLoader(loaders?.vue),
            getMdxLoader(loaders?.mdx),
            getHtmlLoader(),
            getSVGLoader(),
            getAvifLoader(),
            getImageLoader(),
            getAssetLoader(),
            getJson5Loader(),
            getCSSLoader({ isEnvDevelopment, useSourceMap }),
            getCSSModuleLoader({ isEnvDevelopment, useSourceMap }),
            getLessLoader({ isEnvDevelopment, useSourceMap }),
            getLessModuleLoader({ isEnvDevelopment, useSourceMap }),
            getSassLoader({ isEnvDevelopment, useSourceMap }),
            getSassModuleLoader({ isEnvDevelopment, useSourceMap })
          ]
        }
        // ...(args?.module?.rules || [])
      ].filter(Boolean) as RuleSetRule[]
    },
    plugins: [
      // @see https://webpack.js.org/plugins/progress-plugin/
      bar &&
        new WebpackBar(
          typeof bar === 'object'
            ? bar
            : {
                name
              }
        ),
      /*----------------------------------------------------------------*/
      env &&
        isExist(path.resolve(process.cwd(), '.env')) &&
        new Dotenv(typeof env === 'boolean' ? {} : env),
      /*----------------------------------------------------------------*/
      new webpack.ProvidePlugin({
        // process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      }),
      /*----------------------------------------------------------------*/
      // isExistVue && new VueLoaderPlugin(),
      /*----------------------------------------------------------------*/
      /*----------------------------------------------------------------*/
      // @see https://github.com/johnagan/clean-webpack-plugin
      clean && new CleanWebpackPlugin(clean !== true ? clean : {}),
      /*----------------------------------------------------------------*/
      caseSensitivePaths &&
        new CaseSensitivePathsPlugin(
          typeof caseSensitivePaths === 'object' ? caseSensitivePaths : {}
        ),
      /*----------------------------------------------------------------*/
      ignore &&
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
          ...(typeof ignore === 'object' ? ignore : {})
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
      copy &&
        new CopyWebpackPlugin({
          patterns: [
            existsSync(paths.public) && !isEmptyDir(paths.public)
              ? {
                  from: paths.public,
                  filter: filename => {
                    return (
                      filename !==
                      resolve(paths.root, `${paths.publicUrlOrPath}/index.html`)
                    )
                  },
                  globOptions: {
                    ignore: ['*.DS_Store']
                  }
                }
              : {
                  from: resolve(__dirname, 'public'),
                  filter: filename => {
                    return filename !== resolve(paths.root, 'public/index.html')
                  },
                  globOptions: {
                    ignore: ['*.DS_Store']
                  }
                },
            ...(typeof copy !== 'boolean' ? copy.patterns : [])
          ],
          options: typeof copy === 'boolean' ? {} : copy.options
        }),
      /*----------------------------------------------------------------*/
      isExistWindiCSS && new WindCSSPlugin(),
      /*----------------------------------------------------------------*/
      // [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
      // isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
      /*----------------------------------------------------------------*/
      isTypeScriptProject &&
        new ForkTSCheckerWebpackPlugin({
          logger: 'webpack-infrastructure', // { infrastructure: 'silent', issues: 'console' }
          typescript: {
            context: paths.root,
            configFile: tsconfigFile,
            configOverwrite: {
              compilerOptions: {
                module: 'commonjs'
              }
            }
          }
        }),
      /*----------------------------------------------------------------*/
      isEnvDevelopment && isTypeScriptProject && new ReactRefreshPlugin(),
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
                minify: false,
                favicon: resolve(__dirname, 'public/favicon.ico'),
                template: isExist(indexHtml)
                  ? indexHtml
                  : resolve(__dirname, './public/index.ejs')
              }
        ),
      ...(Array.isArray(html)
        ? html.map(option => new HtmlWebpackPlugin(option))
        : []),
      /*----------------------------------------------------------------*/
      inlineChunkHtml &&
        new InlineChunkHtmlPlugin(
          HtmlWebpackPlugin,
          Array.isArray(inlineChunkHtml) ? inlineChunkHtml : [/runtime-.+[.]js/]
        ),
      /*----------------------------------------------------------------*/
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
          ignoreOrder: true
        }),
      /*----------------------------------------------------------------*/
      manifest &&
        new WebpackManifestPlugin({
          fileName: 'assets.json',
          publicPath: paths.publicUrlOrPath,
          ...(typeof manifest === 'object' ? manifest : {})
        }),
      /*----------------------------------------------------------------*/
      BUNDLE_ANALYZER === 'true' &&
        new BundleAnalyzerPlugin(bundleAnalyzer || {})
    ].filter(Boolean) as Configuration['plugins'],
    optimization: {
      splitChunks: {
        // chunks: 'all',
        // minSize: 20480,
        // maxInitialRequests: 10,
        // maxAsyncRequests: 10,
        // cacheGroups: {
        //   commons: {
        //     test: /[\\/]node_modules[\\/]/,
        //     chunks: 'initial',
        //     name: 'vendors',
        //     priority: -10,
        //     enforce: true,
        //     reuseExistingChunk: true
        //   }
        // }
        chunks: 'async',
        minSize: 20480,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 40960,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'nodemodules-commons',
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
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
    },
    stats: isEnvProduction ? defaultProductionStats : defaultStats,
    infrastructureLogging: {
      level: 'warn'
    }
  }
}
