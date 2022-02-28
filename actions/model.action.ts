import { resolve } from 'path'
import { createServer } from '@kunlunjs/model-design'
import type { ModelGeneratePlugin } from '@kunlunjs/model-design/dist/types'
import { red } from 'chalk'
import { glob } from 'glob'
import type { ModelOptions } from '../commands/model.command'
import { AbstractAction } from '.'

function hasNestJs(pkgPath: string) {
  const pkg = require(pkgPath)
  return pkg.dependencies['@nestjs/core'] || pkg.devDependencies['@nestjs/core']
}

function unsupport() {
  console.error(red('This may not a KunlunJS application'))
  process.exit(-1)
}

export class ModelAction extends AbstractAction<ModelOptions> {
  private serverGenerator: ModelGeneratePlugin = (
    { action, currentModel },
    models
  ) => {
    console.log(action, currentModel, models)
  }
  public async handle() {
    // 判断当前是单项目还是多项目来获得项目路径
    let projectRoot: string | null = null
    const subPackages = glob.sync(
      resolve(process.cwd(), 'packages/*/package.json')
    )
    if (subPackages.length > 0) {
      for (const sub of subPackages) {
        if (hasNestJs(sub)) {
          projectRoot = sub.replace('/package.json', '')
          break
        }
      }
      if (!projectRoot) {
        return unsupport()
      }
    } else {
      if (hasNestJs(resolve(process.cwd(), 'package.json'))) {
        projectRoot = process.cwd()
      } else {
        return unsupport()
      }
    }

    const server = await createServer({
      prismaDir: resolve(projectRoot, 'prisma'),
      modelPlugins: [this.serverGenerator]
    })
    server.run()
  }
}
