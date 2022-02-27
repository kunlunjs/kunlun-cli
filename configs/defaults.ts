import { existsSync } from 'fs'
import * as path from 'path'
import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import { getPackageJson } from '../lib/utils/package'
import type { DefinePluginOptions } from './types'

const dependencies = getPackageJson('dependencies')
const devDependencies = getPackageJson('devDependencies')

export const defaultBabelPresetEnvOptions: BabelPresetEnvOptions = {
  useBuiltIns: 'entry',
  corejs: 3,
  exclude: ['transform-typeof-symbol']
}

export const isDefaultEnvDevelopment = process.env.NODE_ENV !== 'production'
export const isDefaultUseSourceMap = process.env.SOURCE_MAP !== 'true'

export const isDefaultTypeScriptProject = existsSync(
  path.resolve(process.cwd(), 'tsconfig.json')
)

export const isExistTailwindCSS =
  existsSync(path.resolve(process.cwd(), 'tailwind.config.js')) &&
  devDependencies?.tailwindcss

export const isDefaultReactProject = !!dependencies?.react
export const isDefaultVueProject = !!dependencies?.vue
export const isDefaultTypeScriptFrontProject =
  (isDefaultReactProject || isDefaultVueProject) && isDefaultTypeScriptProject

export const defaultDefinePluginOption: DefinePluginOptions = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  ...Object.keys(process.env).reduce((acc, key) => {
    if (key.startsWith('VITE_')) {
      acc[`import.meta.env.${key}`] = JSON.stringify(process.env[key])
    }
    return acc
  }, {} as Record<string, any>)
}
