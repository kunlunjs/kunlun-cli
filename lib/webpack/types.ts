import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import type CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import type { CleanWebpackPlugin } from 'clean-webpack-plugin'
import type CompressionWebpackPlugin from 'compression-webpack-plugin'
import type CopyWebpackPlugin from 'copy-webpack-plugin'
import type Dotenv from 'dotenv-webpack'
import type HtmlWebpackPlugin from 'html-webpack-plugin'
import type InlineChunkHtmlPlugin from 'inline-chunk-html-plugin'
import type { Configuration } from 'webpack'
import type { DefinePlugin, IgnorePlugin } from 'webpack'
import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import type { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import type { ManifestPluginOptions } from 'webpack-manifest-plugin'
import type WebpackBar from 'webpackbar'

export type Rule = Required<
  Pick<Required<Pick<Configuration, 'module'>>['module'], 'rules'>
>['rules'][number]

export type DotenvOptions = ConstructorParameters<typeof Dotenv>[0]
export type BarPluginOptions = ConstructorParameters<typeof WebpackBar>[0]
export type DefinePluginOptions = ConstructorParameters<typeof DefinePlugin>[0]
export type IgnorePluginOptions = ConstructorParameters<typeof IgnorePlugin>[0]
export type CleanPluginOptions = ConstructorParameters<
  typeof CleanWebpackPlugin
>[0]
export type CopyPluginOptions = ConstructorParameters<
  typeof CopyWebpackPlugin
>[0]
export type HtmlPluginOptions = ConstructorParameters<
  typeof HtmlWebpackPlugin
>[0]
export type CompressionPluginOptions = ConstructorParameters<
  typeof CompressionWebpackPlugin
>[0]
export type InlineChunkHtmlPluginOptions = ConstructorParameters<
  typeof InlineChunkHtmlPlugin
>[1]
export type BundleAnalyzerPluginOptions = ConstructorParameters<
  typeof BundleAnalyzerPlugin
>[0]
export type CaseSensitivePathsPluginOptions = ConstructorParameters<
  typeof CaseSensitivePathsPlugin
>[0]

export type WebpackPlugins = {
  env?: boolean | DotenvOptions
  bar?: boolean | BarPluginOptions
  banner?: string // | BannerPluginOptions
  copy?: CopyPluginOptions
  ignore?: IgnorePluginOptions
  define?: Record<string, string>
  clean?: boolean | CleanPluginOptions
  manifest?: boolean | ManifestPluginOptions
  bundleAnalyzer?: BundleAnalyzerPluginOptions
  inlineChunkHtml?: InlineChunkHtmlPluginOptions
  compression?: boolean | CompressionPluginOptions
  caseSensitvePaths?: CaseSensitivePathsPluginOptions
  html?: boolean | HtmlPluginOptions | HtmlPluginOptions[]
}

export type WebpackLoaders = {
  less?: {
    strictMath?: boolean
    ieCompat?: boolean
    javascriptEnabled?: boolean
    globalVars?: Record<string, string>
    modifyVars?: Record<string, string>
  }
  babel?: {
    presetEnv?: BabelPresetEnvOptions
  }
}

export type WebpackConfig = Omit<
  Configuration,
  'mode' | 'module' | 'plugins'
> & {
  tsconfigFile?: string
  engine?: 'webpack'
  module?: Omit<Configuration['module'], 'rules'>
  loaders?: WebpackLoaders
  plugins?: WebpackPlugins
  devServer?: DevServerConfiguration & {
    startCallback?: () => void
    stopCallback?: () => void
  }
}
