import type { Configuration } from 'webpack'
import type { WebpackPlugins } from './types'
const CompressionPlugin = require('compression-webpack-plugin')

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
        ? new CompressionPlugin()
        : false
    ].filter(Boolean) as Configuration['plugins']
  }
}
