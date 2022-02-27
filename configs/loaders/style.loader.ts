import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import type { RuleSetUseItem } from 'webpack'
import { getPostCSSConfig } from '../configs/postcss.config'
import { isDefaultEnvDevelopment, isDefaultUseSourceMap } from '../defaults'

export const getStyleLoaders = (
  options: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
    cssOptions?: Record<string, any>
  } = {
    isEnvDevelopment: isDefaultEnvDevelopment,
    useSourceMap: isDefaultUseSourceMap,
    cssOptions: {}
  },
  preProcessor?:
    | 'less-loader'
    | {
        loader: 'less-loader'
        options?: {
          strictMath?: boolean
          noIeCompat?: boolean
          javascriptEnabled?: boolean
          globalVars?: Record<string, string>
          modifyVars?: Record<string, string>
        }
      }
    | 'sass-loader'
    | {
        loader: 'sass-loader'
        options?: {
          sourceMap?: boolean
        }
      }
) => {
  const { isEnvDevelopment, useSourceMap, cssOptions } = options

  const loaders: RuleSetUseItem[] = [
    isEnvDevelopment
      ? require.resolve('style-loader')
      : MiniCSSExtractPlugin.loader,
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        sourceMap: useSourceMap,
        postcssOptions: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          config: false,
          plugins: getPostCSSConfig({ isEnvDevelopment: isEnvDevelopment })
        }
      }
    }
  ]
  if (preProcessor) {
    loaders.push({
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap: useSourceMap,
        root: process.cwd()
      }
    })
  }
  if (
    preProcessor === 'less-loader' ||
    (typeof preProcessor === 'object' && preProcessor?.loader === 'less-loader')
  ) {
    const isObj = typeof preProcessor === 'object'
    const lessOptions = (isObj && preProcessor?.options) || {
      strictMath: false,
      noIeCompat: true,
      javascriptEnabled: true,
      globalVars: {},
      modifyVars: {}
    }
    loaders.push({
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: options.useSourceMap,
        lessOptions
      }
    })
  }
  if (
    preProcessor === 'sass-loader' ||
    (typeof preProcessor === 'object' && preProcessor?.loader === 'sass-loader')
  ) {
    loaders.push({
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: useSourceMap
      }
    })
  }
  return loaders
}
