import * as chalk from 'chalk'
import type { BuildOptions } from '../commands/build.command'
import { ViteCompiler } from '../lib/compiler/vite-compiler'
import { WebpackCompiler } from '../lib/compiler/webpack-compiler'
import { ERROR_PREFIX } from '../lib/ui'
import { AbstractAction } from './abstract.action'

export class BuildAction extends AbstractAction<BuildOptions> {
  public async handle(options: BuildOptions) {
    process.env.NODE_ENV = 'production'
    try {
      if (options.vite) {
        const viteCompiler = new ViteCompiler()
        viteCompiler.run({}, false)
      } else {
        const webpackCompiler = new WebpackCompiler()
        webpackCompiler.run({
          mode: 'production'
        })
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log(`\n${ERROR_PREFIX} ${err.message}\n`)
      } else {
        console.error(`\n${chalk.red(err)}\n`)
      }
    }
  }
}
