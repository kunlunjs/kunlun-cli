import * as chalk from 'chalk'
import type { Command } from 'commander'
import { BuildAction, NewAction, StartAction, InfoAction } from '../actions'
import { ModelAction } from '../actions/model.action'
import { ERROR_PREFIX } from '../lib/ui'
import { BuildCommand } from './build.command'
import { InfoCommand } from './info.command'
import { ModelCommand } from './model.command'
import { NewCommand } from './new.command'
import { StartCommand } from './start.command'
export class CommandLoader {
  public static load(program: Command): void {
    new NewCommand(new NewAction()).load(program)
    new BuildCommand(new BuildAction()).load(program)
    new StartCommand(new StartAction()).load(program)
    new InfoCommand(new InfoAction()).load(program)
    new ModelCommand(new ModelAction()).load(program)
    this.handleInvalidCommand(program)
  }

  private static handleInvalidCommand(program: Command) {
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
