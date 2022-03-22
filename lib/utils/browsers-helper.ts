import { readFileSync, writeFileSync } from 'fs'
import os from 'os'
import browserslist from 'browserslist'
import chalk from 'chalk'
import { pkgUp } from 'pkg-up'
import prompts from 'prompts'

export const defaultBrowsers = {
  production: ['>0.2%', 'not dead', 'not op_mini all'],
  development: [
    'last 1 chrome version',
    'last 1 firefox version',
    'last 1 safari version'
  ]
}

function shouldSetBrowsers(isInteractive: boolean) {
  if (!isInteractive) {
    return Promise.resolve(true)
  }

  const question: prompts.PromptObject = {
    type: 'confirm',
    name: 'shouldSetBrowsers',
    message:
      chalk.yellow("We're unable to detect target browsers.") +
      `\n\nWould you like to add the defaults to your ${chalk.bold(
        'package.json'
      )}?`,
    initial: true
  }

  return prompts(question).then(answer => {
    answer.shouldSetBrowsers()
  })
}

export function checkBrowsers(
  dir: string,
  isInteractive: boolean,
  retry = true
): Promise<any> {
  const current = browserslist.loadConfig({ path: dir })
  if (current !== null) {
    return Promise.resolve(current)
  }

  if (!retry) {
    return Promise.reject(
      new Error(
        chalk.red('You must specify targeted browsers.') +
          os.EOL +
          `Please add a ${chalk.underline(
            'browserslist'
          )} key to your ${chalk.bold('package.json')}.`
      )
    )
  }

  return shouldSetBrowsers(isInteractive).then(shouldSetBrowsers => {
    if (!shouldSetBrowsers) {
      return checkBrowsers(dir, isInteractive, false)
    }
    return pkgUp({ cwd: dir })
      .then(filePath => {
        if (!filePath) {
          return Promise.reject()
        }
        const pkg = JSON.parse(readFileSync(filePath) as unknown as string)
        pkg['browserslist'] = defaultBrowsers
        writeFileSync(filePath, JSON.stringify(pkg, null, 2) + os.EOL)
        browserslist.clearCaches()
        console.log()
        // TODO
        // console.log(
        //   `${chalk.green('Set target browsers:')} ${chalk.cyan(
        //     defaultBrowsers.join(', ')
        //   )}`
        // )
        console.log()
      })
      .catch(() => {})
      .then(() => checkBrowsers(dir, isInteractive, false))
  })
}
