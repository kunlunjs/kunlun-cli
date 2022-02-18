import type { Command } from 'commander'
import { AbstractCommand } from './abstract.command'

export interface InfoOptions {
  //
}

export class InfoCommand extends AbstractCommand<InfoOptions> {
  public load(program: Command) {
    program
      .command('info')
      .alias('i')
      .description('Display Kunlun project details.')
      .action(async () => {
        await this.action.handle()
      })
  }
}
