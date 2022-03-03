import type { Configuration } from 'webpack'
import type { WebpackLoaders, WebpackPlugins } from './lib/webpack/types'

type Config = Exclude<Configuration, ['rules', 'plugin']> & {
  loaders?: WebpackLoaders
  plugins?: WebpackPlugins
}

export type DefineConfig = {
  start?: Config
  build?: Config
  preview?: Record<string, string>
}

export function defineConfig(config: DefineConfig): DefineConfig
