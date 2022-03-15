/* eslint-disable @typescript-eslint/consistent-type-imports */
import chalk from 'chalk'
import { Answers } from 'inquirer'
import { GenerateOptions } from '../commands/generate.command'
import { getValueOrDefault } from '../lib/compiler/helpers/get-value-or-default'
import {
  AbstractCollection,
  Collection,
  CollectionFactory,
  SchematicOption
} from '../lib/schematics'
import { MESSAGES } from '../lib/ui'
import { BackendloadConfiguration } from '../lib/utils/load-configuration'
import {
  askForProjectName,
  moveDefaultProjectToStart,
  shouldAskForProject,
  shouldGenerateSpec
} from '../lib/utils/project-utils'
import { AbstractAction } from './abstract.action'

export class GenerateAction extends AbstractAction<GenerateOptions> {
  public async handle(options: GenerateOptions) {
    await generateFiles(options)
  }
}

const generateFiles = async (options: GenerateOptions) => {
  const configuration = await BackendloadConfiguration()
  const collectionOption = options.collection as string
  const schematic = options.schematic as string
  const appName = options.name as string
  const path = options.path as string
  const spec = options.spec ?? true

  const collection: AbstractCollection = CollectionFactory.create(
    collectionOption || configuration.collection || Collection.KUNLUNJS
  )
  const schematicOptions: SchematicOption[] = Object.keys(options).reduce<
    SchematicOption[]
  >((acc, cur) => {
    if (options[cur as keyof typeof options]) {
      acc.push(new SchematicOption(cur, options[cur as keyof typeof options]))
    }
    return acc
  }, [])

  const configurationProjects = configuration.projects

  let sourceRoot = appName
    ? getValueOrDefault(configuration, 'sourceRoot', appName)
    : configuration.sourceRoot

  const specValue = spec as boolean
  let generateSpec = shouldGenerateSpec(
    configuration,
    schematic,
    appName,
    specValue
  )

  // If you only add a `lib` we actually don't have monorepo: true BUT we do have "projects"
  // Ensure we don't run for new app/libs schematics
  if (shouldAskForProject(schematic, configurationProjects, appName)) {
    const defaultLabel = ' [ Default ]'
    let defaultProjectName: string = configuration.sourceRoot + defaultLabel

    for (const property in configurationProjects) {
      if (
        configurationProjects[property].sourceRoot === configuration.sourceRoot
      ) {
        defaultProjectName = property + defaultLabel
        break
      }
    }

    const projects = moveDefaultProjectToStart(
      configuration,
      defaultProjectName,
      defaultLabel
    )

    const answers: Answers = await askForProjectName(
      MESSAGES.PROJECT_SELECTION_QUESTION,
      projects
    )

    const project: string = answers.appName.replace(defaultLabel, '')
    if (project !== configuration.sourceRoot) {
      sourceRoot = configurationProjects[project].sourceRoot
    }

    if (answers.appName !== defaultProjectName) {
      // Only overwrite if the appName is not the default- as it has already been loaded above
      generateSpec = shouldGenerateSpec(
        configuration,
        schematic,
        answers.appName,
        specValue
        // specOptions.passedAsInput
      )
    }
  }

  schematicOptions.push(new SchematicOption('sourceRoot', sourceRoot))
  schematicOptions.push(new SchematicOption('spec', generateSpec))
  try {
    if (!schematic) {
      throw new Error('Unable to find a schematic for this configuration')
    }
    await collection.execute(schematic as string, schematicOptions)
  } catch (error) {
    if (error && error.message) {
      console.error(chalk.red(error.message))
    }
  }
}
