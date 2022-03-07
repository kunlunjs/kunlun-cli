/* eslint-disable @typescript-eslint/consistent-type-imports */
import chalk from 'chalk'
import Table from 'cli-table3'
import { Command } from 'commander'
import { KunlunCollection } from '../lib/schematics/kunlun.collection'
import { AbstractCommand } from './abstract.command'

export interface GenerateOptions {
  schematic: string
  name: string
  path: string
  spec: boolean | string
  dryRun: boolean
  flat: boolean
  collection: string
  project: string
}

export class GenerateCommand extends AbstractCommand<GenerateOptions> {
  public load(program: Command) {
    program
      .command('generate <schematic> [name] [path]')
      .alias('g')
      .description(this.buildDescription())
      .option(
        '-d, --dry-run',
        'Report actions that would be taken without writing out results.'
      )
      .option('-p, --project [project]', 'Project in which to generate files.')
      .option('--flat', 'Enforce flat structure of generated element.')
      .option('--spec', 'Enforce spec files generation.', () => {
        return { value: true, passedAsInput: true }
      })
      .option('--no-spec', 'Disable spec files generation.', () => {
        return { value: false, passedAsInput: true }
      })
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use.'
      )
      .action(
        async (
          schematic: string,
          name: string,
          path: string,
          command: Omit<GenerateOptions, 'schematic' | 'name' | 'path'>
        ) => {
          const mergedOptions = {
            schematic,
            name,
            path,
            ...command
          }
          await this.action.handle(mergedOptions as GenerateOptions)
        }
      )
  }

  private buildDescription(): string {
    return (
      'Generate a Kunlun element.\n' +
      `  Schematics available on ${chalk.bold(
        '@kunlunjs/schematics'
      )} collection:\n` +
      this.buildSchematicsListAsTable()
    )
  }

  private buildSchematicsListAsTable(): string {
    const leftMargin = '    '
    const tableConfig = {
      head: ['name', 'alias', 'description'],
      chars: {
        'left': leftMargin.concat('│'),
        'top-left': leftMargin.concat('┌'),
        'bottom-left': leftMargin.concat('└'),
        'mid': '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': ''
      }
    }
    const table: any = new Table(tableConfig)
    for (const schematic of KunlunCollection.getSchematics()) {
      table.push([
        chalk.green(schematic.name),
        chalk.cyan(schematic.alias),
        schematic.description
      ])
    }
    return table.toString()
  }
}
