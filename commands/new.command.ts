import type { Command } from 'commander'
import { InvalidArgumentError } from 'commander'
import { Collection } from '../lib/schematics'
import { AbstractCommand } from './abstract.command'

export interface NewOptions {
  name?: string
  directory?: string
  dryRun?: boolean
  skipGit?: boolean
  skipInstall?: boolean
  packageManager?: string
  type?: string
  collection?: string
  strict?: boolean
}
export class NewCommand extends AbstractCommand<NewOptions> {
  public load(program: Command) {
    program
      .command('new [name]')
      .alias('n')
      .description('Generate Kunlun application.')
      .option('--directory [directory]', 'Specify the destination directory')
      .option(
        '-d, --dry-run',
        'Report actions that would be performed without writing out results.'
      )
      .option('-g, --skip-git', 'Skip git repository initialization.')
      .option('-s, --skip-install', 'Skip package installation.')
      .option(
        '-p, --package-manager [package-manager]',
        'Specify package manager.',
        'npm'
      )
      .option(
        '-t, --type [project type]',
        'Project type(react/vue/taro/uniapp/nest-prisma-restful/nest-prisma-graphql/react+nest-prisma-restfull/react+nest-prisma-graphql).',
        value => {
          const availableProjectTypes = [
            'react',
            'vue',
            'taro',
            'uniapp',
            'nest-prisma-restful',
            'nest-prisma-graphql',
            'react+nest-prisma-restful',
            'react+nest-prisma-graphql'
          ]
          // 'react + nest-prisma-restful (monorepo)' -> 'react+nest-prisma-restful'
          const projectType = value.toLowerCase().replace(/\s+|\(\w+\)/g, '')
          const projectTypeMatch = availableProjectTypes.includes(projectType)
          if (!projectTypeMatch) {
            throw new InvalidArgumentError(
              `Invalid type "${value}" provided. Available type are "${availableProjectTypes.join(
                `" or "`
              )}"`
            )
          }
          return value
        }
      )
      // .option(
      //   '-l, --language [language]',
      //   'Programming language to be used (TypeScript or JavaScript).'
      // )
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use.',
        Collection.KUNLUNJS
      )
      .option('--strict', 'Enables strict mode in TypeScript.')
      .action(
        async (name: string | undefined, options: Omit<NewOptions, 'name'>) => {
          // const options: Input[] = []
          // const availableLanguages = ['js', 'ts', 'javascript', 'typescript']
          // }
          // if (!!command.language) {
          //   const lowercasedLanguage = command.language.toLowerCase()
          //   const langMatch = availableLanguages.includes(lowercasedLanguage)
          //   if (!langMatch) {
          //     throw new Error(
          //       `Invalid language "${command.language}" selected. Available languages are "typescript" or "javascript"`
          //     )
          //   }
          //   switch (lowercasedLanguage) {
          //     case 'javascript':
          //       command.language = 'js'
          //       break
          //     case 'typescript':
          //       command.language = 'ts'
          //       break
          //     default:
          //       command.language = lowercasedLanguage
          //       break
          //   }
          // }
          // options.push({
          //   name: 'language',
          //   value: !!command.language ? command.language : 'ts'
          // })

          // const inputs: Input[] = []
          // inputs.push({ name: 'name', value: name })

          await this.action.handle({
            name,
            ...options
          })
        }
      )
  }
}
