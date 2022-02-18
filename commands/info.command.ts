import type { CommanderStatic } from 'commander'
import { AbstractCommand } from './abstract.command'

export class InfoCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('info')
      .alias('i')
      .description('Display Kunlun project details.')
      .action(async () => {
        await this.action.handle()
      })
  }
}
