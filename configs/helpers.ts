import { normalize } from 'path'
import escape from 'escape-string-regexp'
import { paths } from './defaults'
import type { DefinePluginOptions } from './types'

export const ignoredFiles = (src: string = paths.root) => {
  return new RegExp(
    `^(?!${escape(
      normalize(src + '/').replace(/[\\]+/g, '/')
    )}).+/node_modules/`,
    'g'
  )
}

export const getPublicUrlOrPath = (
  isEnvDevelopment: boolean,
  homepage: string,
  envPublichUrl?: string
) => {
  const stubDomain = ''
  if (envPublichUrl) {
    envPublichUrl = envPublichUrl.endsWith('/')
      ? envPublichUrl
      : envPublichUrl + '/'
    const validPublicUrl = new URL(envPublichUrl, stubDomain)
    return isEnvDevelopment
      ? envPublichUrl.startsWith('.')
        ? '/'
        : validPublicUrl
      : envPublichUrl
  }

  if (homepage) {
    homepage = homepage.endsWith('/') ? homepage : homepage + '/'
    const validHomepagePathname = new URL(homepage, stubDomain).pathname
    return isEnvDevelopment
      ? homepage.startsWith('.')
        ? '/'
        : validHomepagePathname
      : homepage.startsWith('.')
      ? homepage
      : validHomepagePathname
  }

  return '/'
}

export const defaultDefinePluginOption: DefinePluginOptions = {
  ...Object.keys(process.env).reduce((acc, key) => {
    if (key.startsWith('VITE_')) {
      acc[`import.meta.env.${key}`] = JSON.stringify(process.env[key])
    } else {
      acc[key] = JSON.stringify(process.env[key])
    }
    return acc
  }, {} as Record<string, any>)
}
