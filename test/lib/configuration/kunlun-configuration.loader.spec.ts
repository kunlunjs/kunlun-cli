import type {
  Configuration,
  ConfigurationLoader
} from '../../../lib/configuration'
import { KunlunConfigurationLoader } from '../../../lib/configuration/kunlun-configuration.loader'
import type { Reader } from '../../../lib/readers'

describe('Kunlun Configuration Loader', () => {
  let reader: Reader
  beforeAll(() => {
    const mock = jest.fn()
    mock.mockImplementation(() => {
      return {
        readAnyOf: jest.fn(() =>
          Promise.resolve(
            JSON.stringify({
              // language: 'ts',
              collection: '@kunlunjs/schematics',
              type: 'react'
            })
          )
        ),
        read: jest.fn(() =>
          Promise.resolve(
            JSON.stringify({
              // language: 'ts',
              collection: '@kunlunjs/schematics',
              type: 'react',
              entryFile: 'secondary'
            })
          )
        )
      }
    })
    reader = mock()
  })
  it('should call reader.readAnyOf when load', async () => {
    const loader: ConfigurationLoader = new KunlunConfigurationLoader(reader)
    const configuration: Configuration = await loader.load()
    expect(reader.readAnyOf).toHaveBeenCalledWith([
      'kunlun.config.js',
      'kunlun.config.ts',
      '.kunlunrc.js',
      '.kunlunrc.ts'
    ])
    expect(configuration).toEqual({
      // language: 'ts',
      collection: '@kunlunjs/schematics',
      type: 'react',
      sourceRoot: 'src',
      entryFile: 'main',
      monorepo: false,
      projects: {},
      compilerOptions: {
        assets: [],
        plugins: [],
        tsConfigPath: 'tsconfig.build.json',
        webpack: false,
        webpackConfigPath: 'webpack.config.js'
      },
      generateOptions: {}
    })
  })
  it('should call reader.read when load with filename', async () => {
    const loader: ConfigurationLoader = new KunlunConfigurationLoader(reader)
    const configuration: Configuration = await loader.load(
      'nest-cli.secondary.config.json'
    )
    expect(reader.read).toHaveBeenCalledWith('nest-cli.secondary.config.json')
    expect(configuration).toEqual({
      // language: 'ts',
      collection: '@kunlunjs/schematics',
      type: 'react',
      sourceRoot: 'src',
      entryFile: 'secondary',
      monorepo: false,
      projects: {},
      compilerOptions: {
        assets: [],
        plugins: [],
        tsConfigPath: 'tsconfig.build.json',
        webpack: false,
        webpackConfigPath: 'webpack.config.js'
      },
      generateOptions: {}
    })
  })
})
