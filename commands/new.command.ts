import type { Command, CommanderStatic } from 'commander'
import { Collection } from '../lib/schematics'
import { AbstractCommand } from './abstract.command'
import type { Input } from './command.input'

export class NewCommand extends AbstractCommand {
  public load(program: CommanderStatic) {
    program
      .command('new [name]')
      .alias('n')
      .description('Generate Kunlun application.')
      .option(
        '-t, --type [project type]',
        'Project type(React/Vue/Nest-Prisma-RESTfull/Nest-Prisma-GraphQL).'
      )
      .option('--directory [directory]', 'Specify the destination directory')
      .option(
        '-d, --dry-run',
        'Report actions that would be performed without writing out results.'
      )
      .option('-g, --skip-git', 'Skip git repository initialization.')
      .option('-s, --skip-install', 'Skip package installation.')
      .option(
        '-p, --package-manager [package-manager]',
        'Specify package manager.'
      )
      // .option(
      //   '-l, --language [language]',
      //   'Programming language to be used (TypeScript or JavaScript).'
      // )
      .option(
        '-c, --collection [collectionName]',
        'Schematics collection to use.'
      )
      .option('--strict', 'Enables strict mode in TypeScript.')
      .action(async (name: string, command: Command) => {
        const options: Input[] = []
        const availableLanguages = ['js', 'ts', 'javascript', 'typescript']
        options.push({ name: 'directory', value: command.directory })
        options.push({ name: 'dry-run', value: !!command.dryRun })
        options.push({ name: 'skip-git', value: !!command.skipGit })
        options.push({ name: 'skip-install', value: !!command.skipInstall })
        options.push({ name: 'strict', value: !!command.strict })
        options.push({
          name: 'package-manager',
          value: command.packageManager
        })
        if (!!command.type) {
          const lowercasedType = command.type.toLowerCase()
          const langMatch = availableLanguages.includes(lowercasedType)
          if (!langMatch) {
            throw new Error(
              `Invalid type "${command.language}" selected. Available type are "react" or "vue" or "nest-prisma-restful" or "nest-prisma-graphql"`
            )
          }
          switch (lowercasedType) {
            case 'react':
              command.language = 'React'
              break
            case 'vue':
              command.language = 'vue'
              break
            case 'nest-prisma-restful':
              command.language = 'nest-prisma-restful'
              break
            case 'nest-prisma-graphql':
              command.language = 'nest-prisma-graphql'
            default:
              command.language = lowercasedType
              break
          }
        }
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
        options.push({
          name: 'collection',
          value: command.collection || Collection.KUNLUNJS
        })

        const inputs: Input[] = []
        inputs.push({ name: 'name', value: name })

        await this.action.handle(inputs, options)
      })
  }
}
