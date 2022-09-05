import type { Command } from 'commander'
import { AbstractCommand } from './abstract.command'

export interface StartOptions {
  app?: string
  config?: string
  path?: string
  watch?: boolean
  webpack?: boolean
  vite?: boolean
}

export class StartCommand extends AbstractCommand<StartOptions> {
  public load(program: Command): void {
    program
      .command('start [app]')
      .option('-c, --config [path]', 'Path to kunlun-cli configuration file.')
      .option('-p, --path [path]', 'Path to tsconfig file.')
      .option('-w, --watch', 'Run in watch mode (live-reload).')
      .option('--webpack', 'Use webpack for compilation.')
      // .option('--vite', 'Use vite for compilation.')
      .description('Start Kunlun application.')
      .action(
        async (
          app: string | undefined,
          options: Omit<StartOptions, 'app'>,
          command: Command
        ) => {
          await this.action.handle({
            app,
            ...options
          })
        }
      )
  }
}
