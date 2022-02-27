import { existsSync } from 'fs'
import { join } from 'path'
import type * as ts from 'typescript'
import { paths } from '../../../configs/defaults'
import { CLI_ERRORS } from '../../ui'
import type { TSBinaryLoader } from '../typescript-loader'

export class TsConfigProvider {
  constructor(private readonly typescriptLoader: TSBinaryLoader) {}

  public getByConfigFilename(configFilename: string) {
    const configPath = join(paths.root, configFilename)
    if (!existsSync(configPath)) {
      throw new Error(CLI_ERRORS.MISSING_TYPESCRIPT(configFilename))
    }
    const tsBinary = this.typescriptLoader.load()
    const parsedCmd = tsBinary.getParsedCommandLineOfConfigFile(
      configPath,
      undefined!,
      tsBinary.sys as unknown as ts.ParseConfigFileHost
    )
    const { options, fileNames, projectReferences } = parsedCmd!
    return { options, fileNames, projectReferences }
  }
}
