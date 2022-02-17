import * as chalk from 'chalk'
import webpack = require('webpack')
import type { BuildOptions } from '../commands/build.command'
import { WebpackCompiler } from '../lib/compiler/webpack-compiler'
import { ERROR_PREFIX } from '../lib/ui'
import { AbstractAction } from './abstract.action'

export class BuildAction extends AbstractAction<BuildOptions> {
  protected readonly compiler = new WebpackCompiler()

  public async handle(options: BuildOptions) {
    try {
      await this.runBuild()
    } catch (err) {
      if (err instanceof Error) {
        console.log(`\n${ERROR_PREFIX} ${err.message}\n`)
      } else {
        console.error(`\n${chalk.red(err)}\n`)
      }
    }
  }

  public async runBuild() {
    this.compiler.run({
      mode: 'production'
    })
  }
}
