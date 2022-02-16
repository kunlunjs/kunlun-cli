import * as fs from 'fs'
import * as path from 'path'

export function getPackageJson(field?: string) {
  const pkg = path.resolve(process.cwd(), 'package.json')
  const obj = fs.existsSync(pkg)
    ? field
      ? require(pkg)[field]
      : require(pkg)
    : {}
  return obj
}
