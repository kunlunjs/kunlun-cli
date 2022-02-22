import * as chalk from 'chalk'
import type { StartOptions } from '../commands/start.command'
import { ViteCompiler } from '../lib/compiler/vite-compiler'
import { WebpackCompiler } from '../lib/compiler/webpack-compiler'
import { ERROR_PREFIX } from '../lib/ui'
import { AbstractAction } from './abstract.action'

export class StartAction extends AbstractAction<StartOptions> {
  public async handle(options: StartOptions) {
    process.env.NODE_ENV = 'development'
    try {
      if (options.vite) {
        const viteCompiler = new ViteCompiler()
        await viteCompiler.run({}, true)
      } else {
        const webpackCompiler = new WebpackCompiler()
        webpackCompiler.run({
          mode: 'development'
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
