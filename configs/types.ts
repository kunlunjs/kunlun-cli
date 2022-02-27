import CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
import type { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CompressionWebpackPlugin = require('compression-webpack-plugin')
import CopyWebpackPlugin = require('copy-webpack-plugin')
import HtmlWebpackPlugin = require('html-webpack-plugin')
import type { Configuration } from 'webpack'
import type { DefinePlugin } from 'webpack'

export type Rule = Required<
  Pick<Required<Pick<Configuration, 'module'>>['module'], 'rules'>
>['rules'][number]

export type DefinePluginOptions = ConstructorParameters<typeof DefinePlugin>[0]
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
export type CaseSensitivePathsPluginOptions = ConstructorParameters<
  typeof CaseSensitivePathsPlugin
>[0]

export type WebpackPlugins = {
  banner?: string // | BannerPluginOptions
  copy?: CopyPluginOptions
  define?: Record<string, string>
  clean?: true | CleanPluginOptions
  case?: CaseSensitivePathsPluginOptions
  compression?: boolean | CompressionPluginOptions
  html?: boolean | HtmlPluginOptions | HtmlPluginOptions[]
}
