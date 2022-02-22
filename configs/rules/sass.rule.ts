import { getPostCSSConfig } from 'configs/postcss.config'
import * as MiniCSSExtractPlugin from 'mini-css-extract-plugin'
import { isDefaultDevelopment } from '../defaults'
import type { Rule } from '../types'

export const getSassRule = (args: { isDevelopment?: true } = {}): Rule => {
  const { isDevelopment = isDefaultDevelopment } = args

  return {
    test: /\.s[ac]ss$/,
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
      },
      {
        // https://github.com/webpack-contrib/less-loader
        loader: 'sass-loader',
        options: {
          sourceMap: isDevelopment
        }
      }
    ]
  }
}
