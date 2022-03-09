import { resolve, sep } from 'path'
import { createServer } from '@kunlunjs/model-design'
import type { ModelGeneratePlugin } from '@kunlunjs/model-design/dist/types'
import chalk from 'chalk'
import { glob } from 'glob'
import type { ModelOptions } from '../commands/model.command'
import { generateAdminModule } from '../lib/generator/admin'
import { AbstractAction } from '.'

function hasNestJs(pkgPath: string) {
  const pkg = require(pkgPath)
  return (
    pkg.dependencies?.['@nestjs/core'] || pkg.devDependencies?.['@nestjs/core']
  )
}

function isAdmin(pkgPath: string, projectName: string) {
  const pkg = require(pkgPath)
  return pkg.dependencies?.[`react`] && ['admin', 'web'].includes(projectName)
}

function unsupport() {
  console.error(chalk.red('This may not a KunlunJS application'))
  process.exit(-1)
}

export class ModelAction extends AbstractAction<ModelOptions> {
  private serverGenerator: ModelGeneratePlugin = (
    currentModel,
    { enums, models }
  ) => {
    console.log(currentModel, enums, models)
  }

  public async handle() {
    // 判断当前是单项目还是多项目来获得项目路径
    let isMonorepo = false
    let serverRoot = ''
    let adminRoot = ''
    const subPackages = glob.sync(
      resolve(process.cwd(), 'packages/*/package.json')
    )
    if (subPackages.length > 0) {
      isMonorepo = true
      for (const sub of subPackages) {
        if (!serverRoot && hasNestJs(sub)) {
          serverRoot = sub.replace('/package.json', '')
        } else if (
          !adminRoot &&
          isAdmin(sub, sub.match(/packages\/(.+)\/package.json/)![1])
        ) {
          adminRoot = sub.replace('/package.json', '')
        }
      }
    } else {
      const curPkg = resolve(process.cwd(), 'package.json')
      if (hasNestJs(curPkg)) {
        serverRoot = process.cwd()
      } else if (isAdmin(curPkg, process.cwd().split('/')[1])) {
        adminRoot = process.cwd()
      } else {
        return unsupport()
      }
    }

    if (serverRoot) {
      const plugins: ModelGeneratePlugin[] = [this.serverGenerator]
      if (adminRoot) {
        plugins.push((cur, { enums, models }) =>
          generateAdminModule(
            adminRoot
              .replace(process.cwd(), '')
              .replace(new RegExp(`^${sep}`), ''),
            cur.name,
            { ...cur, models, enums: enums ?? [] }
          )
        )
      }
      const server = await createServer({
        prismaDir: resolve(serverRoot, 'prisma'),
        modelPlugins: plugins
      })
      server.run()
    } else {
      unsupport()
    }
  }
}
