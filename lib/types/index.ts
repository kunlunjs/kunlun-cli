import type { WebpackConfig } from '../webpack/types'

export type CommandType = 'start' | 'build' | 'preview' | 'deploy'

// TODO
export type ViteConfig = {
  engine?: 'vite'
  [key: string]: any
}

// TODO
export type RollupConfig = {
  engine?: 'rollup'
  [key: string]: any
}

export type KunlunDefineConfig = {
  start?: WebpackConfig | ViteConfig | RollupConfig
  build?: WebpackConfig | ViteConfig | RollupConfig
  preview?: Record<string, any>
  deploy?: Record<string, any>
}

export function defineConfig(config: KunlunDefineConfig) {
  return config
}
