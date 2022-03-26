import { readFileSync } from 'fs'
import { platform, release } from 'os'
import { join } from 'path'
import chalk from 'chalk'
import osName = require('os-name')
import type { InfoOptions } from '../commands/info.command'
import type { AbstractPackageManager } from '../lib/package-managers'
import { PackageManagerFactory } from '../lib/package-managers'
import { BANNER, MESSAGES } from '../lib/ui'
import { AbstractAction } from './abstract.action'

interface LockfileDependency {
  version: string
}

type PackageJsonDependencies = Record<string, LockfileDependency>

interface KunlunDependency {
  name: string
  value: string
}

export class InfoAction extends AbstractAction<InfoOptions> {
  private manager!: AbstractPackageManager

  public async handle() {
    this.manager = await PackageManagerFactory.find()
    this.displayBanner()
    await this.displaySystemInformation()
    await this.displayKunlunInformation()
  }

  private displayBanner() {
    console.info(chalk.red(BANNER))
  }

  private async displaySystemInformation(): Promise<void> {
    console.info(chalk.green('[System Information]'))
    console.info('OS Version     :', chalk.blue(osName(platform(), release())))
    console.info('NodeJS Version :', chalk.blue(process.version))
    await this.displayPackageManagerVersion()
  }

  async displayPackageManagerVersion() {
    try {
      const version: string = await this.manager.version()
      console.info(
        `${this.manager.name} Version    :`,
        chalk.blue(version),
        '\n'
      )
    } catch {
      console.error(
        `${this.manager.name} Version    :`,
        chalk.red('Unknown'),
        '\n'
      )
    }
  }

  async displayKunlunInformation(): Promise<void> {
    this.displayCliVersion()
    console.info(chalk.green('[Kunlun Platform Information]'))
    await this.displayKunlunInformationFromPackage()
  }

  async displayKunlunInformationFromPackage(): Promise<void> {
    try {
      const dependencies: PackageJsonDependencies =
        this.readProjectPackageDependencies()
      this.displayKunlunVersions(dependencies)
    } catch (err) {
      console.error(
        chalk.red(MESSAGES.KUNLUN_INFORMATION_PACKAGE_MANAGER_FAILED)
      )
    }
  }

  displayCliVersion(): void {
    console.info(chalk.green('[Kunlun CLI]'))
    console.info(
      'Kunlun CLI Version :',
      chalk.blue(
        JSON.parse(readFileSync(join(__dirname, '../package.json')).toString())
          .version
      ),
      '\n'
    )
  }

  readProjectPackageDependencies(): PackageJsonDependencies {
    const buffer = readFileSync(join(process.cwd(), 'package.json'))
    const pack = JSON.parse(buffer.toString())
    const dependencies = { ...pack.dependencies, ...pack.devDependencies }
    Object.keys(dependencies).forEach(key => {
      dependencies[key] = {
        version: dependencies[key]
      }
    })
    return dependencies
  }

  displayKunlunVersions(dependencies: PackageJsonDependencies) {
    this.buildKunlunVersionsMessage(dependencies).forEach(dependency =>
      console.info(dependency.name, chalk.blue(dependency.value))
    )
  }

  buildKunlunVersionsMessage(
    dependencies: PackageJsonDependencies
  ): KunlunDependency[] {
    const KunlunDependencies = this.collectKunlunDependencies(dependencies)
    return this.format(KunlunDependencies)
  }

  collectKunlunDependencies(
    dependencies: PackageJsonDependencies
  ): KunlunDependency[] {
    const KunlunDependencies: KunlunDependency[] = []
    Object.keys(dependencies).forEach(key => {
      if (key.indexOf('@kunlunjs') > -1) {
        const depPackagePath = require.resolve(key + '/package.json', {
          paths: [process.cwd()]
        })
        const depPackage = readFileSync(depPackagePath).toString()
        const value = JSON.parse(depPackage).version
        KunlunDependencies.push({
          name: `${key.replace(/@kunlunjs\//, '').replace(/@.*/, '')} version`,
          value: value || dependencies[key].version
        })
      }
    })
    return KunlunDependencies
  }

  format(dependencies: KunlunDependency[]): KunlunDependency[] {
    const sorted = dependencies.sort(
      (dependencyA, dependencyB) =>
        dependencyB.name.length - dependencyA.name.length
    )
    const length = sorted[0].name.length
    sorted.forEach(dependency => {
      if (dependency.name.length < length) {
        dependency.name = this.rightPad(dependency.name, length)
      }
      dependency.name = dependency.name.concat(' :')
      dependency.value = dependency.value.replace(/(\^|~)/, '')
    })
    return sorted
  }

  rightPad(name: string, length: number): string {
    while (name.length < length) {
      name = name.concat(' ')
    }
    return name
  }
}
