import { getPostCSSConfig } from 'configs/postcss.config'
import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import { isDefaultDevelopment } from '../defaults'
import type { Rule } from '../types'

export const getCSSRule = (args: { isDevelopment?: boolean } = {}): Rule => {
  const { isDevelopment = isDefaultDevelopment } = args

  return {
    test: /\.css$/,
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
        }
      }
    ]
  }
}
