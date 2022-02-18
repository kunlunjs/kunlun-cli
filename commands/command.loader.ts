import * as chalk from 'chalk'
import type { CommanderStatic } from 'commander'
import { BuildAction, NewAction, StartAction, InfoAction } from '../actions'
import { ERROR_PREFIX } from '../lib/ui'
import { BuildCommand } from './build.command'
import { InfoCommand } from './info.command'
import { NewCommand } from './new.command'
import { StartCommand } from './start.command'
export class CommandLoader {
  public static load(program: CommanderStatic): void {
    new NewCommand(new NewAction()).load(program)
    new BuildCommand(new BuildAction()).load(program)
    new StartCommand(new StartAction()).load(program)
    new InfoCommand(new InfoAction()).load(program)

    this.handleInvalidCommand(program)
  }

  private static handleInvalidCommand(program: CommanderStatic) {
    program.on('command:*', () => {
      console.error(
        `\n${ERROR_PREFIX} Invalid command: ${chalk.red('%s')}`,
        program.args.join(' ')
      )
      console.log(
        `See ${chalk.red('--help')} for a list of available commands.\n`
      )
      process.exit(1)
    })
  }
}
