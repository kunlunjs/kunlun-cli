import type { Configuration } from 'webpack'
import { merge } from 'webpack-merge'
import type { Config } from './types'
import { getCommonConfig } from './webpack.common.config'
import { getProductionConfig } from './webpack.production.config'

export const getWebpackConfig = (args: Config = {}): Configuration => {
  const { mode, plugins } = args
  return merge<Configuration>(
    getCommonConfig(args),
    mode === 'production'
      ? getProductionConfig({
          plugins
        })
      : {}
  )
}
