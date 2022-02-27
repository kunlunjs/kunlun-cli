import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import type { Configuration } from 'webpack'
import { merge } from 'webpack-merge'
import type { WebpackPlugins } from './types'
import { getCommonConfig } from './webpack.common.config'
import { getProductionConfig } from './webpack.production.config'

export const getWebpackConfig = (
  args: Configuration & {
    plugins?: WebpackPlugins
    babel?: BabelPresetEnvOptions
  } = {}
): Configuration => {
  const { mode, plugins } = args
  return merge<Configuration>(
    getCommonConfig({ mode, plugins }),
    mode === 'production'
      ? getProductionConfig({
          compression: plugins?.compression
        })
      : {}
  )
}
