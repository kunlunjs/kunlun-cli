import fs from 'fs'

export function isEmptyDir(path: string) {
  try {
    const directory = fs.opendirSync(path)
    const entry = directory.readSync()
    directory.closeSync()
    return entry === null
  } catch {
    return false
  }
}
