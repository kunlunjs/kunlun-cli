import CompressionPlugin = require('compression-webpack-plugin')
import type { Configuration } from 'webpack'
import type { CompressionPluginOptions } from './types'

export const getProductionConfig = (
  args: { compression?: boolean | CompressionPluginOptions } = {}
): Configuration => {
  const { compression } = args

  return {
    mode: 'production',
    plugins: [
      compression &&
        new CompressionPlugin(
          typeof compression === 'boolean' ? undefined : compression
        )
    ].filter(Boolean) as Configuration['plugins']
  }
}
