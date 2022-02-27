import type { RuleSetUseItem } from 'webpack'
import { getPostCSSConfig } from '../configs/postcss.config'
import { isDefaultEnvDevelopment, paths } from '../defaults'
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

export const getStyleLoaders = (
  options: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
    cssOptions?: Record<string, any>
  } = {
    isEnvDevelopment: isDefaultEnvDevelopment,
    useSourceMap: isDefaultEnvDevelopment,
    cssOptions: {}
  },
  preProcessor?:
    | {
        loader: 'less-loader'
        options?: {
          sourceMap?: boolean
          lessOptions?: {
            strictMath?: boolean
            ieCompat?: boolean
            javascriptEnabled?: boolean
            globalVars?: Record<string, string>
            modifyVars?: Record<string, string>
          }
        }
      }
    | {
        loader: 'sass-loader'
        options?: {
          sourceMap?: boolean
        }
      }
) => {
  const { isEnvDevelopment, useSourceMap, cssOptions } = options

  const loaders: RuleSetUseItem[] = [
    // isEnvDevelopment
    //   ? require.resolve('style-loader')
    //   : MiniCSSExtractPlugin.loader,
    MiniCSSExtractPlugin.loader,
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
        sourceMap: true,
        root: paths.root
      }
    })
  }
  if (preProcessor?.loader === 'less-loader') {
    const lessOptions = preProcessor?.options?.lessOptions || {}
    loaders.push({
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: useSourceMap,
        lessOptions
      }
    })
  }
  if (preProcessor?.loader === 'sass-loader') {
    loaders.push({
      loader: require.resolve('sass-loader'),
      options: {
        sourceMap: useSourceMap
      }
    })
  }
  return loaders
}
