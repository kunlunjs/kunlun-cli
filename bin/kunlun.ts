#!/usr/bin/env node

import { program } from 'commander'
import { CommandLoader } from '../commands'
import {
  loadLocalBinCommandLoader,
  localBinExists
} from '../lib/utils/local-binaries'

const bootstrap = () => {
  program
    .version(
      require('../package.json').version,
      '-v, --version',
      'Output the current version.'
    )
    .usage('<command> [options]')
    .helpOption('-h, --help', 'Output usage information.')
  if (localBinExists()) {
    const localCommandLoader = loadLocalBinCommandLoader()
    localCommandLoader.load(program)
  } else {
    CommandLoader.load(program)
  }
  program.parse()

  if (!process.argv.slice(2).length) {
    program.outputHelp()
  }
}

bootstrap()
