import { join } from 'path'
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin'
import webpack = require('webpack')
import nodeExternals = require('webpack-node-externals')
import { isDefaultEnvDevelopment, paths } from '../../../configs/defaults'
import { defaultConfiguration } from '../../configuration/defaults'
import { appendTsExtension } from '../helpers/append-extension'
import type { MultiKunlunCompilerPlugins } from '../plugins-loader'

export const webpackDefaultsFactory = (
  sourceRoot: string,
  entryFilename: string,
  relativeSourceRoot: string,
  isDebugEnabled = false,
  tsConfigFile = defaultConfiguration.compilerOptions.tsConfigPath,
  plugins: MultiKunlunCompilerPlugins
): webpack.Configuration => ({
  entry: appendTsExtension(join(sourceRoot, entryFilename)),
  devtool: isDebugEnabled ? 'inline-source-map' : false,
  target: 'node',
  output: {
    filename: join(relativeSourceRoot, `${entryFilename}.js`)
  },
  ignoreWarnings: [/^(?!CriticalDependenciesWarning$)/],
  externals: [nodeExternals() as any],
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: [
          {
            loader: require.resolve('ts-loader'),
            options: {
              transpileOnly: !isAnyPluginRegistered(plugins),
              configFile: tsConfigFile,
              getCustomTransformers: (program: any) => ({
                before: plugins.beforeHooks.map(hook => hook(program)),
                after: plugins.afterHooks.map(hook => hook(program)),
                afterDeclarations: plugins.afterDeclarationsHooks.map(hook =>
                  hook(program)
                )
              })
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigFile
      })
    ]
  },
  mode: 'none',
  optimization: {
    nodeEnv: false
  },
  node: {
    __filename: false,
    __dirname: false
  },
  plugins: [
    new webpack.IgnorePlugin({
      checkResource(resource: any) {
        const lazyImports = [
          '@kunlunjs/microservices',
          'cache-manager',
          'class-validator',
          'class-transformer'
        ]
        if (!lazyImports.includes(resource)) {
          return false
        }
        try {
          require.resolve(resource, {
            paths: [paths.root]
          })
        } catch (err) {
          return true
        }
        return false
      }
    }),
    new ForkTsCheckerWebpackPlugin({
      async: isDefaultEnvDevelopment,
      typescript: {
        context: paths.src,
        configFile: tsConfigFile,
        diagnosticOptions: {
          syntactic: true
        },
        mode: 'write-references'
        // profile: true
        // configOverwrite: {},
      },
      issue: {
        // This one is specifically to match during CI tests,
        // as micromatch doesn't match
        // '../cra-template-typescript/template/src/App.tsx'
        // otherwise.
        include: [
          { file: '../**/src/**/*.{ts,tsx}' },
          { file: '**/src/**/*.{ts,tsx}' }
        ],
        exclude: [
          { file: '**/src/**/__tests__/**' },
          { file: '**/src/**/?(*.){spec|test}.*' },
          { file: '**/src/setupProxy.*' },
          { file: '**/src/setupTests.*' }
        ]
      },
      logger: 'webpack-infrastructure'
    })
  ]
})

function isAnyPluginRegistered(plugins: MultiKunlunCompilerPlugins) {
  return (
    (plugins.afterHooks && plugins.afterHooks.length > 0) ||
    (plugins.beforeHooks && plugins.beforeHooks.length > 0) ||
    (plugins.afterDeclarationsHooks &&
      plugins.afterDeclarationsHooks.length > 0)
  )
}
