import * as chalk from 'chalk'
import webpack = require('webpack')
import WebpackDevServer = require('webpack-dev-server')
import { getWebpackConfig } from '../../configs/webpack.config'
import { getDevServerConfig } from '../../configs/webpack.dev-server.config'
import { ip } from './helpers/ip'
// import { INFO_PREFIX } from '../ui'

export class WebpackCompiler {
  constructor() {}

  public run(
    configuration: Parameters<typeof getWebpackConfig>[0] = {},
    watch = false,
    onSuccess?: () => void
  ) {
    const port = process.env.PORT || 8000
    if (configuration.mode === 'development') {
      watch = true
    }
    const webpackConfiguration = getWebpackConfig(configuration)
    const compiler = webpack(webpackConfiguration)

    const afterCallback = (
      err: Error | null | undefined,
      stats: webpack.Stats | undefined
    ) => {
      if (err && stats === undefined) {
        // Could not complete the compilation
        // The error caught is most likely thrown by underlying tasks
        console.log(err)
        return process.exit(1)
      }
      const statsOutput = stats!.toString({
        colors: true
      })
      if (!err && !stats?.hasErrors()) {
        if (onSuccess) {
          onSuccess()
        }
        console.log(statsOutput)
      } else if (watch) {
        console.log(statsOutput)
        console.log()
        console.log(
          chalk.green(`🚀 App running at:
      - Local:   ${chalk.underline(`http://localhost:${port}`)}
      - Network: ${chalk.underline(`http://${ip}:${port}`)}`)
        )
        return process.exit(1)
      }
    }
    if (configuration.watch || configuration.mode === 'development') {
      compiler.hooks.watchRun.tapAsync('Rebuid info', (params, callback) => {
        // console.log(`\n${INFO_PREFIX} Webpack is building your  sources...\n`)
        callback()
      })
      // compiler.watch(configuration.watchOptions! || {}, afterCallback)
      const server = new WebpackDevServer(
        getDevServerConfig(configuration.devServer),
        compiler
      )
      server.start()
    } else {
      compiler.run(afterCallback)
    }
  }
}
