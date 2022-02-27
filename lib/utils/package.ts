import * as fs from 'fs'
import * as path from 'path'
import { paths } from '../../configs/defaults'

export function getPackageJson(field?: string) {
  const pkg = path.resolve(paths.root, 'package.json')
  const obj = fs.existsSync(pkg)
    ? field
      ? require(pkg)[field]
      : require(pkg)
    : {}
  return obj
}
