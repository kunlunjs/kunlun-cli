import { accessSync } from 'fs'

export function isExist(path: string) {
  try {
    accessSync(path)
    return true
  } catch {
    return false
  }
}
