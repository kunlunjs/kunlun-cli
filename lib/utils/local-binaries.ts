import { statSync } from 'fs'
import { join, posix } from 'path'
import type { CommandLoader } from '../../commands'

const localBinPathSegments = [process.cwd(), 'node_modules', '@kunlunjs', 'cli']

export function localBinExists() {
  // return existsSync(join(...localBinPathSegments))
  return statSync(join(...localBinPathSegments)).isDirectory()
}

export function loadLocalBinCommandLoader(): typeof CommandLoader {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandsFile = require(posix.join(
    ...localBinPathSegments,
    'dist',
    'commands'
  ))
  return commandsFile.CommandLoader
}
