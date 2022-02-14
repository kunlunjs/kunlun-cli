import type { Configuration } from 'webpack'
import { merge } from 'webpack-merge'
import { isDefaultDevelopment } from './defaults'
import type { BabelPresetEnvOptions, WebpackPlugins } from './types'
import { getCommonConfig } from './webpack.common.config'
import { getProductionConfig } from './webpack.production.config'

export const getWebpackConfig = (
  args: Configuration & {
    isDevelopment?: boolean
    isProduction?: boolean
    plugins?: WebpackPlugins
    babel?: BabelPresetEnvOptions
  } = {}
): Configuration => {
  const {
    isDevelopment = isDefaultDevelopment,
    isProduction = !isDefaultDevelopment,
    mode,
    plugins
  } = args

  return merge<Configuration>(
    getCommonConfig({ isDevelopment, mode, plugins }),
    isProduction || mode === 'production'
      ? getProductionConfig({
          compression: plugins?.compression
        })
      : {}
  )
}
