import * as glob from 'glob'
import type { BabelPresetEnvOptions, DefinePluginOptions } from './types'

export const defaultBabelPresetEnvOptions: BabelPresetEnvOptions = {
  useBuiltIns: 'usage',
  corejs: '3.21.0'
}

export const isDefaultDevelopment = process.env.NODE_ENV !== 'production'

export const isDefaultTypeScriptProject = !!glob.sync(
  `${process.cwd()}/**/*.ts`,
  {}
).length

export const isDefaultTypeScriptReactProject = !!glob.sync(
  `${process.cwd()}/**/*.tsx`,
  {}
).length

export const defaultDefinePluginOption: DefinePluginOptions = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  ...Object.keys(process.env).reduce((acc, key) => {
    if (key.startsWith('VITE_')) {
      acc[`import.meta.env.${key}`] = JSON.stringify(process.env[key])
    }
    return acc
  }, {} as Record<string, any>)
}
