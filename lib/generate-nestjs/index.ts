import { basename, dirname, join } from 'path'
import { generatorHandler } from '@prisma/generator-helper'
import type { GeneratorOptions } from '@prisma/generator-helper'
import { parseEnvValue } from '@prisma/sdk'
import fs from 'fs-extra'
import makeDir from 'make-dir'
import { run } from './generator'
import { stringToBoolean } from './generator/helpers'
import type { WriteableFileSpecs } from './generator/types'

export const generate = (options: GeneratorOptions) => {
  const { generator } = options
  const { config } = generator
  const output = parseEnvValue(generator.output!)

  const { generateSchemaOfModule } = config

  const exportRelationModifierClasses = stringToBoolean(
    config.exportRelationModifierClasses,
    true
  )

  const outputToNestJSResourceStructure = stringToBoolean(
    config.outputToNestJSResourceStructure,
    false
  )

  const reExport = stringToBoolean(config.reExport, true)

  const results = run({
    output,
    dmmf: options.dmmf,
    exportRelationModifierClasses,
    outputToNestJSResourceStructure,
    generateSchemaOfModule
  })

  const indexCollections: Record<string, WriteableFileSpecs> = {
    [output]: {
      fileName: `${output}/index.ts`,
      content: ''
    }
  }
  const subFolders: string[] = []
  if (reExport) {
    results.forEach(({ fileName }) => {
      const dirName = dirname(fileName)
      const subFolder = dirName.replace(`${output}/`, '')
      if (
        dirName !== output &&
        !dirName.match(/modules/) &&
        !subFolders.includes(subFolder)
      ) {
        subFolders.push(subFolder)
      }
      const { [dirName]: fileSpec } = indexCollections
      indexCollections[dirName] = {
        fileName: fileSpec?.fileName || join(dirName, 'index.ts'),
        content: [
          fileSpec?.content || '',
          `export * from './${basename(fileName, '.ts')}';`
        ].join('\n')
      }
    })
    subFolders.forEach(folder => {
      indexCollections[output].content += `\n export * from './${folder}'`
    })
  }

  return Promise.all(
    results
      .concat(Object.values(indexCollections))
      .map(async ({ fileName, content }) => {
        const dirName = dirname(fileName)
        const fname = basename(fileName)
        const newDirname = dirName + '.new'
        const isExistModule = fs.existsSync(fileName)
        const isExistNewModule = fs.existsSync(newDirname)
        const isModuleFile = fileName.match(/modules/)
        if (isModuleFile && !isExistModule && !isExistNewModule) {
          await makeDir(dirName)
          return fs.writeFile(fileName, content)
        } else if (isModuleFile && isExistModule) {
          await makeDir(newDirname)
          return fs.writeFile(`${newDirname}/${fname}`, content)
        } else {
          await makeDir(dirName)
          return fs.writeFile(fileName, content)
        }
      })
  )
}

/**
 * 入口函数，特定结构，可以自动寻找 prisma/schema.prisma 并解析
 */
generatorHandler({
  onManifest: () => ({
    defaultOutput: `${process.cwd()}/src/@generated`,
    prettyName: 'nestjs related source code'
  }),
  onGenerate: generate
})
