import webpack = require('webpack')
import WebpackDevServer = require('webpack-dev-server')
import { getWebpackConfig } from '../../configs/webpack.config'
import { getDevServerConfig } from '../../configs/webpack.dev-server.config'
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
      const statsOutput = stats?.toString({
        colors: true
      })
      if (statsOutput) {
        console.log(statsOutput)
      }
      if (err) {
        // Could not complete the compilation
        // The error caught is most likely thrown by underlying tasks
        console.log(err)
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
