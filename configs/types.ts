import type { CleanWebpackPlugin } from 'clean-webpack-plugin'
import CompressionWebpackPlugin = require('compression-webpack-plugin')
import CopyWebpackPlugin = require('copy-webpack-plugin')
import HtmlWebpackPlugin = require('html-webpack-plugin')
import type { Configuration } from 'webpack'
import type { DefinePlugin } from 'webpack'

export type Rule = Required<
  Pick<Required<Pick<Configuration, 'module'>>['module'], 'rules'>
>['rules'][number]

export type BabelPresetEnvOptions = {
  /**
   * false 默认值，无视浏览器兼容性配置，引入所有 polyfill
   * entry 根据配置的浏览器兼容性，引入浏览器不兼容的 polyfill
   * useage 会根据配置的浏览器兼容性，以及代码中用到的 API 来进行 polyfill
   */
  useBuiltIns?: false | 'entry' | 'usage'
  corejs?: string | { version: string; proposals: boolean }
  targets?:
    | string
    | Array<string>
    | {
        esmodules?: boolean
        firefox?: string
        chrome?: string
        safari?: string
        opera?: string
        edge?: string
        ie?: string
        ios?: string
        android?: string
        electron?: string
        rhino?: string
        samsung?: string
        node?: string | 'current' | true
      }
  bugfixes?: boolean
  spec?: boolean
  loose?: boolean
  modules?: 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false
  debug?: boolean
  include?: Array<string | RegExp>
  exclude?: Array<string | RegExp>
  forceAllTransforms?: boolean
  configPath?: string
  ignoreBrowserslistConfig?: boolean
  browserslistEnv?: string
  shippedProposals?: boolean
}

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

export type WebpackPlugins = {
  banner?: string // | BannerPluginOptions
  copy?: CopyPluginOptions
  define?: Record<string, string>
  clean?: true | CleanPluginOptions
  compression?: boolean | CompressionPluginOptions
  html?: boolean | HtmlPluginOptions | HtmlPluginOptions[]
}
