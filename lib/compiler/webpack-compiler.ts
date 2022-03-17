import chalk from 'chalk'
import { omit } from 'lodash'
import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { KunlunConfigLoader } from '../configuration'
import type { CommandType } from '../types'
// import SpeedMeasurePlugin from 'speed-measure-webpack-plugin'
import { getWebpackConfig } from '../webpack/webpack.config'
import { getDevServerConfig } from '../webpack/webpack.dev-server.config'
// import { ip } from './helpers/ip'
// import { INFO_PREFIX } from '../ui'

export class WebpackCompiler {
  private config = new KunlunConfigLoader()
  constructor() {}

  public run(
    configuration: Parameters<typeof getWebpackConfig>[0] = {},
    command: CommandType,
    onSuccess?: () => void
  ) {
    const { /* SPEED_MEASURE, */ PORT = 8000 } = process.env
    const customConfig = this.config.load(command) || {}
    const webpackConfiguration = getWebpackConfig({
      ...configuration,
      ...customConfig
    })
    // if (SPEED_MEASURE || SPEED_MEASURE === 'true') {
    //   const smp = new SpeedMeasurePlugin()
    //   webpackConfiguration = smp.wrap(webpackConfiguration)
    // }
    const compiler = webpack(webpackConfiguration)

    const afterCallback = (
      err: Error | null | undefined,
      stats: webpack.Stats | undefined
    ) => {
      const statsOutput = stats?.toString({
        ...(typeof webpackConfiguration.stats === 'object'
          ? webpackConfiguration.stats
          : {}),
        colors: true
      })
      if (statsOutput) {
        console.log(statsOutput)
      }
      if (err) {
        // Could not complete the compilation
        // The error caught is most likely thrown by underlying tasks
        console.error(err)
        return process.exit(1)
      }
      if (!stats?.hasErrors()) {
        if (onSuccess) {
          onSuccess()
        }
      }
    }

    if (configuration.watch || configuration.mode === 'development') {
      compiler.hooks.watchRun.tapAsync('Rebuid info', (params, callback) => {
        // console.log(`\n${INFO_PREFIX} Webpack is building your sources...\n`)
        callback()
      })
      // compiler.watch(configuration.watchOptions! || {}, afterCallback)
      const devServerConfig = customConfig.devServer
      const server = new WebpackDevServer(
        getDevServerConfig({
          ...configuration.devServer,
          ...omit(devServerConfig, ['startCallback', 'stopCallback'])
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
    } else {
      compiler.run(afterCallback)
    }
  }
}
