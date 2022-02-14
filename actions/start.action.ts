import * as chalk from 'chalk'
import type { Input } from '../commands'
import { WebpackCompiler } from '../lib/compiler/webpack-compiler'
import { ERROR_PREFIX } from '../lib/ui'
import { AbstractAction } from './abstract.action'

export class StartAction extends AbstractAction {
  protected readonly compiler = new WebpackCompiler()

  public async handle(inputs: Input[], options: Input[]) {
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
      mode: 'development'
    })
  }
}
