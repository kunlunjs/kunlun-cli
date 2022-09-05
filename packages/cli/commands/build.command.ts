import type { Command } from 'commander'
import { AbstractCommand } from './abstract.command'
import type { StartOptions } from './start.command'

export interface BuildOptions extends StartOptions {}

export class BuildCommand extends AbstractCommand<BuildOptions> {
  public load(program: Command): void {
    program
      .command('build [app]')
      .option('-c, --config [path]', 'Path to kunlun-cli configuration file.')
      .option('-p, --path [path]', 'Path to tsconfig file.')
      .option('-w, --watch', 'Run in watch mode (live-reload).')
      .option('--webpack', 'Use webpack for compilation.')
      // .option('--vite', 'Use vite for compilation.')
      .description('Build Kunlun application.')
      .action(async (app: string, options: Omit<BuildOptions, 'app'>) => {
        await this.action.handle({
          app,
          ...options
        })
      })
  }
}
