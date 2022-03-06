import { existsSync } from 'fs'
import { resolve } from 'path'
import type { Reader } from '../readers'
import type { KunlunDefineConfig } from '../webpack/types'
import type { Configuration } from './configuration'
import type { ConfigurationLoader } from './configuration.loader'
import { defaultConfiguration } from './defaults'

export class KunlunConfigurationLoader implements ConfigurationLoader {
  constructor(private readonly reader: Reader) {}

  public async load(name?: string): Promise<Required<Configuration>> {
    const content: string | undefined = name
      ? await this.reader.read(name)
      : await this.reader.readAnyOf(['kunlun.config.js', 'kunlun.config.ts'])

    if (!content) {
      return defaultConfiguration
    }
    const fileConfig = JSON.parse(content)
    if (fileConfig.compilerOptions) {
      return {
        ...defaultConfiguration,
        ...fileConfig,
        compilerOptions: {
          ...defaultConfiguration.compilerOptions,
          ...fileConfig.compilerOptions
        }
      }
    }
    return {
      ...defaultConfiguration,
      ...fileConfig
    }
  }
}

export class KunlunConfigLoader {
  load(): KunlunDefineConfig | undefined {
    const tsConfigFile = resolve(process.cwd(), 'kunlun.config.ts')
    if (existsSync(tsConfigFile) && require(tsConfigFile)) {
      const getConfig = require(tsConfigFile)
      return typeof getConfig === 'function' && getConfig()
    }
    const jsConfigFile = resolve(process.cwd(), 'kunlun.config.js')
    if (existsSync(jsConfigFile) && require(jsConfigFile)) {
      const getConfig = require(jsConfigFile)
      return typeof getConfig === 'function' && getConfig()
    }
    return
  }
}
