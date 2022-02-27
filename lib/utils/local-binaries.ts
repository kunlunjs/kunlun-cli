import { existsSync } from 'fs'
import { join, posix } from 'path'
import type { CommandLoader } from '../../commands'
import { paths } from '../../configs/defaults'

const localBinPathSegments = [paths.root, 'node_modules', '@kunlunjs', 'cli']

export function localBinExists() {
  return existsSync(join(...localBinPathSegments))
}

export function loadLocalBinCommandLoader(): typeof CommandLoader {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const commandsFile = require(posix.join(...localBinPathSegments, 'commands'))
  return commandsFile.CommandLoader
}
