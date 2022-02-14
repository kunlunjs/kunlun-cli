import type { Command, CommanderStatic } from 'commander'
import { AbstractCommand } from './abstract.command'
import type { Input } from './command.input'

export class BuildCommand extends AbstractCommand {
  public load(program: CommanderStatic): void {
    program
      .command('build [app]')
      .option('-c, --config [path]', 'Path to kunlun-cli configuration file.')
      .option('-p, --path [path]', 'Path to tsconfig file.')
      .option('-w, --watch', 'Run in watch mode (live-reload).')
      .option('--webpack', 'Use webpack for compilation.')
      .option('--vite', 'Use vite for compilation.')
      .description('Build Kunlun application.')
      .action(async (app: string, command: Command) => {
        const options: Input[] = []

        const inputs: Input[] = []
        inputs.push({
          name: 'mode',
          value: 'production'
        })
        await this.action.handle(inputs, options)
      })
  }
}
