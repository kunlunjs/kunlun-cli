import chalk from 'chalk'
import type { Command } from 'commander'
import { BuildAction, StartAction } from '../actions'
import { ERROR_PREFIX } from '../lib/ui'
import { BuildCommand } from './build.command'
import { StartCommand } from './start.command'

export class CommandLoader {
  public static load(program: Command): void {
    new BuildCommand(new BuildAction()).load(program)
    new StartCommand(new StartAction()).load(program)
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