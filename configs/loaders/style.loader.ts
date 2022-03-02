import MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import type { RuleSetUseItem } from 'webpack'
import { getPostCSSConfig } from '../configs/postcss.config'
import { paths } from '../defaults'

export const getStyleLoaders = (
  options: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
    cssOptions?: Record<string, any>
  } = {
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
    isEnvDevelopment
      ? require.resolve('style-loader')
      : MiniCSSExtractPlugin.loader,
    {
      loader: require.resolve('css-loader'),
      options: {
        sourceMap: useSourceMap,
        ...cssOptions
      }
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
    const sourceMap = true // preProcessor.options?.sourceMap || useSourceMap
    loaders.push({
      loader: require.resolve('resolve-url-loader'),
      options: {
        sourceMap,
        root: paths.root
      }
    })

    if (preProcessor?.loader === 'less-loader') {
      const lessOptions = preProcessor?.options?.lessOptions || {}
      loaders.push({
        loader: require.resolve('less-loader'), // LessLoader,
        options: {
          sourceMap,
          lessOptions
        }
      })
    }
    if (preProcessor?.loader === 'sass-loader') {
      loaders.push({
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap
        }
      })
    }
  }

  return loaders
}
