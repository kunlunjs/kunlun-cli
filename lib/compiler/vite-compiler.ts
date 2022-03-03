import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { mergeWith } from 'lodash'
import type { InlineConfig, UserConfig } from 'vite'
import { createServer, build } from 'vite'
import { getPostCSSConfig } from '../webpack/configs/postcss.config'
import { isVueProject } from '../webpack/defaults'

export class ViteCompiler {
  constructor() {}

  private getCommonConfig(
    config: UserConfig | undefined,
    isEnvDevelopment: boolean
  ): InlineConfig {
    const root = process.cwd()
    const plugins: InlineConfig['plugins'] = []
    // vue 项目
    if (isVueProject) {
      plugins.push(vue(), vueJsx())
    } else {
      // 默认 react 项目
      plugins.push(react())
    }
    const defaultConfig: InlineConfig = {
      root,
      base: '',
      resolve: {
        alias: {
          '@': resolve(root, 'src'),
          'src': resolve(root, 'src')
        }
      },
      configFile: false,
      css: {
        postcss: {
          plugins: getPostCSSConfig({
            isEnvDevelopment
          })
        }
      },
      plugins
    }
    return mergeWith(defaultConfig, config, (oldValue, newValue) => {
      if (Array.isArray(oldValue)) {
        return [...oldValue, ...newValue]
      }
    })
  }

  private async serve(mergedConfigs: InlineConfig) {
    const server = await createServer({
      ...mergedConfigs,
      mode: 'development',
      server: {
        port: +(process.env.PORT || 8000),
        strictPort: false,
        open: true,
        ...mergedConfigs.server
      }
    })
    await server.listen()
    server.printUrls()
  }

  private async build(mergedConfigs: InlineConfig) {
    try {
      await build({
        ...mergedConfigs,
        mode: 'production',
        build: {
          target: 'modules',
          // https://vitejs.dev/config/#build-csstarget
          cssTarget: 'chrome61',
          ...mergedConfigs.build
        }
      })
    } catch (error) {
      console.error(error)
      process.exit(-1)
    }
  }

  public async run(
    configuration?: UserConfig,
    watch = false,
    onSuccess?: () => void
  ) {
    const mergedConfigs = this.getCommonConfig(configuration, !!watch)
    if (watch) {
      return this.serve(mergedConfigs)
    } else {
      return this.build(mergedConfigs).then(() => onSuccess?.())
    }
  }
}
