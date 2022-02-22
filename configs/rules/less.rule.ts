import { getPostCSSConfig } from 'configs/postcss.config'
import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import { isDefaultDevelopment } from '../defaults'
import type { Rule } from '../types'

export const getLessRule = (
  args: {
    isDevelopment?: boolean
    globalVars?: Record<string, string>
    modifyVars?: Record<string, string>
  } = {}
): Rule => {
  const {
    isDevelopment = isDefaultDevelopment,
    globalVars = {},
    modifyVars = {}
  } = args

  return {
    test: /\.less$/,
    use: [
      MiniCSSExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: isDevelopment
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: isDevelopment,
          postcssOptions: {
            plugins: getPostCSSConfig({ isDevelopment })
          }
          // TODO load postcss.config.js
        }
      },
      {
        // https://github.com/webpack-contrib/less-loader
        loader: 'less-loader',
        options: {
          sourceMap: isDevelopment,
          lessOptions: {
            strictMath: false,
            noIeCompat: true,
            javascriptEnabled: true,
            globalVars,
            modifyVars
          }
        }
      }
    ]
  }
}
