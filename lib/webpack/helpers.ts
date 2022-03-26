import { normalize, posix } from 'path'
import escape from 'escape-string-regexp'
import loaderUtils from 'loader-utils'
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
  // TODO
  // if (homepage) {
  //   homepage = homepage.endsWith('/') ? homepage : homepage + '/'
  //   const validHomepagePathname = new URL(homepage, stubDomain).pathname
  //   return isEnvDevelopment
  //     ? homepage.startsWith('.')
  //       ? '/'
  //       : validHomepagePathname
  //     : homepage.startsWith('.')
  //     ? homepage
  //     : validHomepagePathname
  // }

  return '/'
}

export const defaultDefinePluginOption: DefinePluginOptions = {
  // Conflicting values with Dotenv
  // 'process.env': {},
  // 'process.stdout': null,
  // 'process.platform': 'browser',
  ...Object.keys(process.env).reduce((acc, key) => {
    if (key.startsWith('VITE_')) {
      acc[`import.meta.env.${key}`] = JSON.stringify(process.env[key])
    }
    return acc
  }, {} as Record<string, any>)
}

export const getCSSModuleLocalIdent = (
  context: any, // LoaderContext<any>,
  localIdentName: string,
  localName: string,
  options: any
) => {
  const fileNameOrFolder = context.resourcePath.match(
    /index\.module\.(css|less|scss|sass)$/
  )
    ? '[folder]'
    : '[name]'
  const hash = loaderUtils.getHashDigest(
    Buffer.from(
      posix.relative(context.rootContext, context.resourcePath) + localName
    ),
    'md5',
    'base64',
    5
  )
  const className = loaderUtils.interpolateName(
    context,
    fileNameOrFolder + '_' + localName + '__' + hash,
    options
  )
  return className.replace('.module_', '_').replace(/\./g, '_')
}
