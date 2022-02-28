import type { Command } from 'commander'
import { InvalidArgumentError } from 'commander'
import type { Answers, PromptModule, Question } from 'inquirer'
import { createPromptModule } from 'inquirer'
import { PackageManager } from '../lib/package-managers'
import { ProjectType } from '../lib/project-types'
import { generateInput, generateSelect } from '../lib/questions/questions'
import { Collection } from '../lib/schematics'
import { MESSAGES } from '../lib/ui'
import { AbstractCommand } from './abstract.command'

export interface NewOptions {
  name: string
  type: string
  strict: boolean
  dryRun: boolean
  skipGit: boolean
  directory: string
  collection: string
  skipInstall: boolean
  packageManager: string
}

const availableProjectTypes = Object.keys(ProjectType)
export class NewCommand extends AbstractCommand<NewOptions> {
  public load(program: Command) {
    program
      .command('new [name]')
      .alias('n')
      .description('Generate Kunlun application.')
      .option(
        '-dir, --directory [directory]',
        'Specify the destination directory',
        ''
      )
      .option(
        '-d, --dry-run',
        'Report actions that would be performed without writing out results.',
        false
      )
      .option('-g, --skip-git', 'Skip git repository initialization.', false)
      .option('-s, --skip-install', 'Skip package installation.', false)
      .option(
        '-p, --package-manager [package-manager]',
        'Specify package manager.'
      )
      .option(
        '-t, --type [project type]',
        'Project type(react/vue/taro/uniapp/nest-prisma-restful/nest-prisma-graphql/react+nest-prisma-restfull/react+nest-prisma-graphql).',
        value => {
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
      .option('--strict', 'Enables strict mode in TypeScript.', true)
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
          const mergedOptions = {
            name,
            ...options
          }
          if (!name || !options.type || !options.packageManager) {
            const answers = await this.askForMissingInformation(mergedOptions)
            Object.assign(mergedOptions, answers)
          }

          console.info(MESSAGES.PROJECT_INFORMATION_START)
          console.info()
          await this.action.handle(mergedOptions as NewOptions)
        }
      )
  }
  private askForMissingInformation = async (options: Partial<NewOptions>) => {
    const questions: Question[] = []

    const prompt: PromptModule = createPromptModule()
    if (!options.name) {
      questions.push(
        generateInput(
          'name',
          'What name would you like to use for the new project?'
        )('kunlun-app')
      )
    }
    if (!options.type) {
      questions.push(
        generateSelect('type')(MESSAGES.PROJECT_TYPE_QUESTION)(
          availableProjectTypes
        )
      )
    }
    if (!options.packageManager) {
      questions.push(
        generateSelect('packageManager')(MESSAGES.PACKAGE_MANAGER_QUESTION)([
          PackageManager.PNPM,
          PackageManager.YARN,
          PackageManager.NPM
        ])
      )
    }
    const answers: Answers = await prompt(questions)
    return answers
  }
}
