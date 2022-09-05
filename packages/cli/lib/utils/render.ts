import { exec } from 'child_process'
import { lstat } from 'fs/promises'
import { join, sep } from 'path'
import * as eta from 'eta'
import { ensureFile, writeFile } from 'fs-extra'
import { glob } from 'glob'
import * as inflected from 'inflected'

export type RenderData = Record<string, any>

export function safeString(str: string) {
  return str === undefined ? undefined : str === null ? null : `"${str}"`
}

export async function renderFile(
  fullSourcePath: string,
  fullDistPath: string,
  data: RenderData
) {
  const view = await eta.renderFile(fullSourcePath, {
    ...data,
    ...inflected,
    safeString
  })
  await ensureFile(fullDistPath)
  await writeFile(fullDistPath, view)
}

export async function renderDir(
  dirPath: string,
  data: RenderData,
  distPath = '.',
  format = true
) {
  const ret: string[] = []
  const _dist = join(process.cwd(), distPath)

  const files = glob.sync(join(dirPath, '**/*'))
  for (const file of files) {
    const stat = await lstat(file)
    if (stat.isFile()) {
      const distFile = join(
        _dist,
        file
          .replace(dirPath, '')
          .replace(new RegExp(`^${sep}`), '')
          .replace(/__(.+)__/g, (_, matched) => {
            return data[matched]
          })
      )
      ret.push(distFile)
      await renderFile(file, distFile, data)
    }
  }
  if (format) {
    exec(`npx prettier --write ${ret.join(' ')}`)
  }
  return ret
}
