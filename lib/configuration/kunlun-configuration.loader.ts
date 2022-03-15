import { existsSync } from 'fs'
import { resolve, join } from 'path'
import { register } from 'ts-node'
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

function getRealConfig(config: any) {
  if ('default' in config) {
    return config['default']
  }
  return config
}

export class KunlunConfigLoader {
  load(command: 'start' | 'build'): Config | undefined {
    const tsConfigFile = resolve(process.cwd(), 'kunlun.config.ts')
    if (existsSync(tsConfigFile)) {
      const tsconfigPath = join(__dirname, './kunlun.tsconfig.json')
      register({
        project: tsconfigPath,
        cwd: process.cwd()
      })
      const config = require(tsConfigFile)
      return getRealConfig(config)?.[command]
    }

    const jsConfigFile = resolve(process.cwd(), 'kunlun.config.js')
    if (
      existsSync(jsConfigFile) &&
      (require(jsConfigFile)?.[command] ||
        require(jsConfigFile)?.default?.[command])
    ) {
      const config = require(jsConfigFile)
      return getRealConfig(config)?.[command]
    }
    return
  }
}
