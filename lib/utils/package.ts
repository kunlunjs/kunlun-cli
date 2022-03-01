import { existsSync } from 'fs'
import path from 'path'

export function getPackageJson(field?: string) {
  const pkg = path.resolve(process.cwd(), 'package.json')
  const obj = existsSync(pkg)
    ? field
      ? require(pkg)[field]
      : require(pkg)
    : {}
  return obj
}
