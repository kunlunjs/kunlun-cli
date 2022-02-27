import type { Command } from 'commander'
import { AbstractCommand } from './abstract.command'

export interface ModelOptions {
  //
}

export class ModelCommand extends AbstractCommand<ModelOptions> {
  public load(program: Command) {
    program
      .command('model')
      .alias('m')
      .description('Show online model design')
      .action(async () => {
        await this.action.handle()
      })
  }
}
