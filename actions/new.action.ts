import { execSync } from 'child_process'
import fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { dasherize } from '@angular-devkit/core/src/utils/strings'
import chalk from 'chalk'
import type { NewOptions } from '../commands/new.command'
import { paths } from '../configs/defaults'
import { defaultGitIgnore } from '../lib/configuration/defaults'
import type { AbstractPackageManager } from '../lib/package-managers'
import { PackageManagerFactory } from '../lib/package-managers'
import { GitRunner } from '../lib/runners/git.runner'
import type { AbstractCollection, Collection } from '../lib/schematics'
import { CollectionFactory, SchematicOption } from '../lib/schematics'
import { EMOJIS, MESSAGES } from '../lib/ui'
import { AbstractAction } from './abstract.action'

export class NewAction extends AbstractAction<NewOptions> {
  public async handle(options: NewOptions) {
    await generateApplicationFiles(options).catch(exit)

    const projectDirectory = getProjectDirectory(
      options.name,
      options.directory
    )

    if (!options.skipInstall) {
      await installPackages(options, projectDirectory)
    }
    if (!options.directory) {
      if (!options.skipGit) {
        await initializeGitRepository(projectDirectory)
        await createGitIgnoreFile(projectDirectory)
      }

      printCollective()
    }
    process.exit(0)
  }
}

const getProjectDirectory = (
  applicationName: string,
  directoryOption?: string
): string => {
  return (directoryOption && directoryOption) || dasherize(applicationName)
}

const generateApplicationFiles = async (options: NewOptions) => {
  const collection: AbstractCollection = CollectionFactory.create(
    options.collection as Collection
  )
  const { skipInstall, packageManager, ...restOptions } = options
  const schematicOptions: SchematicOption[] = Object.keys(restOptions).map(
    key =>
      new SchematicOption(key, restOptions[key as keyof typeof restOptions])
  )
  await collection.execute('application', schematicOptions)
  console.info()
}

const installPackages = async (
  options: NewOptions,
  installDirectory: string
) => {
  let packageManager: AbstractPackageManager
  if (options.dryRun) {
    console.info()
    console.info(chalk.green(MESSAGES.DRY_RUN_MODE))
    console.info()
    return
  }
  try {
    packageManager = PackageManagerFactory.create(options.packageManager)
    await packageManager.install(installDirectory, options.packageManager)
  } catch (error) {
    if (error && error.message) {
      console.error(chalk.red(error.message))
    }
  }
}

const initializeGitRepository = async (dir: string) => {
  const runner = new GitRunner()
  await runner.run('init', true, join(paths.root, dir)).catch(() => {
    console.error(chalk.red(MESSAGES.GIT_INITIALIZATION_ERROR))
  })
}

/**
 * Write a file `.gitignore` in the root of the newly created project.
 * `.gitignore` available in `@kunlunjs/schematics` cannot be published to
 * NPM (needs to be investigated).
 *
 * @param dir Relative path to the project.
 * @param content (optional) Content written in the `.gitignore`.
 *
 * @return Resolves when succeeds, or rejects with any error from `fn.writeFile`.
 */
const createGitIgnoreFile = (dir: string, content?: string) => {
  const fileContent = content || defaultGitIgnore
  const filePath = join(paths.root, dir, '.gitignore')
  return promisify(fs.writeFile)(filePath, fileContent)
}

const printCollective = () => {
  // const dim = print('dim')
  const yellow = print('yellow')
  const emptyLine = print()

  emptyLine()
  yellow(`Thanks for installing Kunlun ${EMOJIS.PRAY}`)
  // dim('Please consider donating to our open collective')
  // dim('to help us maintain this package.')
  // emptyLine()
  // emptyLine()
  // print()(
  //   `${chalk.bold(`${EMOJIS.WINE}  Donate:`)} ${chalk.underline(
  //     'https://opencollective.com/kunlun'
  //   )}`
  // )
  emptyLine()
}

const print =
  (color: string | null = null) =>
  (str = '') => {
    const terminalCols = retrieveCols()
    const strLength = str.replace(/\u001b\[[0-9]{2}m/g, '').length
    const leftPaddingLength = Math.floor((terminalCols - strLength) / 2)
    const leftPadding = ' '.repeat(Math.max(leftPaddingLength, 0))
    if (color) {
      str = (chalk as any)[color](str)
    }
    console.log(leftPadding, str)
  }

export const retrieveCols = () => {
  const defaultCols = 80
  try {
    const terminalCols = execSync('tput cols', {
      stdio: ['pipe', 'pipe', 'ignore']
    })
    return parseInt(terminalCols.toString(), 10) || defaultCols
  } catch {
    return defaultCols
  }
}

export const exit = () => process.exit(1)
