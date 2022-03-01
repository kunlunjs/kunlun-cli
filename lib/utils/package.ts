import { existsSync } from 'fs'
import path from 'path'
import { paths } from '../../configs/defaults'

export function getPackageJson(field?: string) {
  const pkg = path.resolve(paths.root, 'package.json')
  const obj = existsSync(pkg)
    ? field
      ? require(pkg)[field]
      : require(pkg)
    : {}
  return obj
}
