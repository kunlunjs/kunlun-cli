import ora from 'ora'
import type {
  AbstractPackageManager,
  ProjectDependency
} from '../package-managers'
import { MESSAGES } from '../ui'

export class KunlunDependencyManager {
  constructor(private packageManager: AbstractPackageManager) {}

  public async read(): Promise<string[]> {
    const production: ProjectDependency[] =
      await this.packageManager.getProduction()
    return production
      .filter(dependency => dependency.name.indexOf('@kunlunjs') > -1)
      .map(dependency => dependency.name)
  }

  public async update(force: boolean, tag = 'latest') {
    const spinner = ora({
      spinner: {
        interval: 120,
        frames: ['▹▹▹▹▹', '▸▹▹▹▹', '▹▸▹▹▹', '▹▹▸▹▹', '▹▹▹▸▹', '▹▹▹▹▸']
      },
      text: MESSAGES.PACKAGE_MANAGER_UPDATE_IN_PROGRESS
    })
    spinner.start()
    const dependencies: string[] = await this.read()
    if (force) {
      await this.packageManager.upgradeProduction(dependencies, tag)
    } else {
      await this.packageManager.updateProduction(dependencies)
    }
    spinner.succeed()
  }
}
