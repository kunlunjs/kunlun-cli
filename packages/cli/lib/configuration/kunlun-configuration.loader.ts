import { cosmiconfigSync } from 'cosmiconfig'
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader'
import type { Reader } from '../readers'
import type { CommandType } from '../types'
import { paths } from '../webpack/defaults'
import type { WebpackConfig } from '../webpack/types'
import type { Configuration } from './configuration'
import type { ConfigurationLoader } from './configuration.loader'
import { defaultConfiguration } from './defaults'

export class KunlunConfigurationLoader implements ConfigurationLoader {
  constructor(private readonly reader: Reader) {}

  public async load(name?: string): Promise<Required<Configuration>> {
    const content: string | undefined = name
      ? await this.reader.read(name)
      : await this.reader.readAnyOf([
          'kunlun.config.js',
          'kunlun.config.ts',
          '.kunlunrc.js',
          '.kunlunrc.ts'
        ])

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

// function getRealConfig(config: any) {
//   if ('default' in config) {
//     return config['default']
//   }
//   return config
// }

const kunlunConfigPrefix = 'kunlun'
const kunlunConfigExplorer = cosmiconfigSync(kunlunConfigPrefix, {
  searchPlaces: [
    `${kunlunConfigPrefix}.config.ts`,
    `${kunlunConfigPrefix}.config.js`,
    `${kunlunConfigPrefix}.config.cjs`,
    `.${kunlunConfigPrefix}rc.ts`,
    `.${kunlunConfigPrefix}rc.js`
  ],
  loaders: {
    '.ts': TypeScriptLoader()
  }
})

export class KunlunConfigLoader {
  load(command: CommandType): WebpackConfig | undefined {
    // {config: { config: { start: ..., build: ... }}, filepath: string }
    const result = kunlunConfigExplorer.search(paths.root)
    const config = result?.config?.[command]
    return config
    // const kunlunTSConfigFile = resolve(process.cwd(), 'kunlun.config.ts')
    // console.log('kunlunTSConfigFile: ', kunlunTSConfigFile)
    // if (existsSync(kunlunTSConfigFile)) {
    //   const tsconfigPath = join(__dirname, './kunlun.tsconfig.json')
    //   register({
    //     project: tsconfigPath,
    //     cwd: process.cwd()
    //   })
    //   const config = require(kunlunTSConfigFile)
    //   return getRealConfig(config)?.[command]
    // }

    // const kunlunJSConfigFile = resolve(process.cwd(), 'kunlun.config.js')
    // console.log('kunlunJSConfigFile: ', kunlunJSConfigFile)
    // if (
    //   existsSync(kunlunJSConfigFile) &&
    //   (require(kunlunJSConfigFile)?.[command] ||
    //     require(kunlunJSConfigFile)?.default?.[command])
    // ) {
    //   const config = require(kunlunJSConfigFile)
    //   return getRealConfig(config)?.[command]
    // }
  }
}
