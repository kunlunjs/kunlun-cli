import { join } from 'path'
import type { DBModelField } from '@kunlunjs/model-design/dist/types'
import { blue, green } from 'chalk'
import type { RenderData } from '../../utils/render'
import { renderDir } from '../../utils/render'

function shortName(name: string) {
  return name.replace(/Model$/, '')
}

function getType(field: DBModelField) {
  switch (field.db.type) {
    case 'BigInt':
    case 'Decimal':
    case 'Float':
    case 'Int':
      return 'number'
    case 'Boolean':
      return 'boolean'
    case 'DateTime':
      return 'date'
    case 'Json':
      return 'json'
    default:
      return 'string'
  }
}

export async function generateAdminModule(
  baseDir: string,
  name: string,
  data: RenderData
) {
  const easyName = shortName(name)
  const renderFiles = await renderDir(
    join(__dirname, './files'),
    { ...data, name: easyName, shortName, getType },
    join(baseDir, './src')
  )
  renderFiles.forEach(file => {
    console.log(green('[Admin generated]:'), blue(file))
  })
}
