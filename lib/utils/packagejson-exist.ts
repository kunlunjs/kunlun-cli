import * as fs from 'fs'
import * as path from 'path'

export function isExistPackageJson(field?: string) {
  const pkg = path.resolve(process.cwd(), 'package.json')
  const obj = fs.existsSync(pkg)
    ? field
      ? require(pkg)[field]
      : require(pkg)
    : {}
  return obj
}
