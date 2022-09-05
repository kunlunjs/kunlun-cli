import chalk from 'chalk'
import { omit } from 'lodash'
import portfinder from 'portfinder'
import semve from 'semver'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { KunlunConfigLoader } from '../configuration'
import type { CommandType } from '../types'
import { paths } from '../webpack/defaults'
import { getWebpackConfig } from '../webpack/webpack.config'
import { getDevServerConfig } from '../webpack/webpack.dev-server.config'
// import { ip } from './helpers/ip'
// import { INFO_PREFIX } from '../ui'

const isInteractive = process.stdout.isTTY

process.on('unhandledRejection', error => {
  throw error
})

export class WebpackCompiler {
  private config = new KunlunConfigLoader()
  constructor() {}

  public async run(
    configuration: Parameters<typeof getWebpackConfig>[0] = {},
    command: CommandType,
    onSuccess?: () => void
  ) {
    const PORT = process.env.PORT || (await portfinder.getPortPromise())
    const react = require(require.resolve('react', {
      paths: [paths.root]
    }))
    const customConfig = (await this.config.load(command)) || {}
    let webpackConfig = getWebpackConfig({
      ...configuration,
      ...customConfig
    })
    if (configuration.mode === 'production') {
      webpackConfig = omit(webpackConfig, ['devServer'])
    }
    const compiler = webpack(webpackConfig)

    const afterCallback = (
      error: Error | null | undefined,
      stats: webpack.Stats | undefined
    ) => {
      const statsOutput = stats?.toString({
        ...(typeof webpackConfig.stats === 'object' ? webpackConfig.stats : {}),
        colors: true
      })
      if (statsOutput) {
        console.log(statsOutput)
      }
      if (error) {
        console.error(error)
        return process.exit(1)
      }
      if (!stats?.hasErrors()) {
        if (onSuccess) {
          onSuccess()
        }
      }
    }

    if (configuration.mode === 'development') {
      compiler.hooks.watchRun.tapAsync('Rebuid info', (params, callback) => {
        // console.log(`\n${INFO_PREFIX} Webpack is building your sources...\n`)
        callback()
      })
      const devServerConfig = customConfig.devServer
      const server = new WebpackDevServer(
        getDevServerConfig({
          ...configuration.devServer,
          ...omit(devServerConfig, ['startCallback', 'stopCallback']),
          port: devServerConfig?.port || PORT
        }),
        compiler
      )
      const localIPv4 = WebpackDevServer.internalIPSync('v4')
      // const localIPv6 = WebpackDevServer.internalIPSync('v6')
      // server.start()
      server.startCallback(
        devServerConfig?.startCallback
          ? devServerConfig.startCallback
          : () => {
              if (isInteractive) {
                // clearConsole()
              }
              if (react && semve.lt(react.version, '16.10.0')) {
                console.log(
                  chalk.yellow(
                    `Fast Refresh requires React 16.10.0 or higher. You are using React ${react.version}`
                  )
                )
              }
              console.log(
                chalk.green(`🚀 Application running at:
    - Local:   ${chalk.underline(`http://localhost:${PORT}`)}
    - Network: ${chalk.underline(`http://${localIPv4}:${PORT}`)}\n`)
              )
            }
      )
      if (devServerConfig?.stopCallback) {
        server.stopCallback(devServerConfig.stopCallback)
      }
      ;['SIGINT', 'SIGTERM'].forEach(sig => {
        process.on(sig, () => {
          server.close()
          process.exit()
        })
      })
      if (process.env.CI !== 'true') {
        process.stdin.on('end', () => {
          server.close()
          process.exit()
        })
      }
    } else {
      compiler.run(afterCallback)
    }
  }
}
