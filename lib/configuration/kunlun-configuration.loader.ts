import { existsSync } from 'fs'
import { resolve } from 'path'
import type { Reader } from '../readers'
import type { Config } from '../webpack/types'
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
  load(command: 'start' | 'build'): Config | undefined {
    const tsConfigFile = resolve(process.cwd(), 'kunlun.config.ts')
    if (existsSync(tsConfigFile) && require(tsConfigFile)?.default?.[command]) {
      const config = require(tsConfigFile)?.default?.[command]
      return config
    }
    const jsConfigFile = resolve(process.cwd(), 'kunlun.config.js')
    if (existsSync(jsConfigFile) && require(jsConfigFile)?.default?.[command]) {
      const config = require(jsConfigFile)?.default?.[command]
      return config
    }
    return
  }
}
