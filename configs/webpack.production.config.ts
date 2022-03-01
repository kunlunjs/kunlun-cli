import CompressionPlugin from 'compression-webpack-plugin'
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin'
import type { Configuration } from 'webpack'
import type { WebpackPlugins } from './types'

export const getProductionConfig = (
  args: { plugins?: WebpackPlugins } = {}
): Configuration => {
  const { plugins = { compression: true } } = args

  return {
    mode: 'production',
    plugins: [
      // @see https://www.npmjs.com/package/compression-webpack-plugin
      typeof plugins?.compression === 'object'
        ? new CompressionPlugin(plugins.compression)
        : plugins?.compression
        ? new CompressionPlugin({
            exclude: /index\.html/
          })
        : false
    ].filter(Boolean) as Configuration['plugins'],
    optimization: {
      minimize: true,
      minimizer: ['...', new CSSMinimizerPlugin()]
    }
  }
}
