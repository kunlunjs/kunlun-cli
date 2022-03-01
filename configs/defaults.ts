import { existsSync } from 'fs'
import { resolve } from 'path'
import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import { getPackageJson } from '../lib/utils/package'
import type { DefinePluginOptions } from './types'

const root = process.cwd()

export const paths = {
  root,
  src: resolve(root, 'src'),
  // html: resolve(root, 'index.html'),
  public: resolve(root, 'public'),
  package: resolve(root, 'package.json'),
  tsconfig: resolve(root, 'tsconfig.json'),
  nodeModules: resolve(root, 'node_modules')
}

const dependencies = getPackageJson('dependencies')
const devDependencies = getPackageJson('devDependencies')

export const defaultBabelPresetEnvOptions: BabelPresetEnvOptions = {
  useBuiltIns: 'entry',
  corejs: 3
}

export const getEnv = () => {
  const env = process.env.NODE_ENV
  return {
    isEnvDevelopment: env === 'development',
    isEnvProduction: env === 'production',
    useSourceMap: process.env.GENERATE_SOURCEMAP !== 'true'
  }
}

export const isDefaultTSProject = existsSync(
  resolve(paths.root, 'tsconfig.json')
)

export const isExistWindiCSS = existsSync(resolve(root, 'windi.config.js'))

export const isExistTailwindCSS =
  existsSync(resolve(root, 'tailwind.config.js')) &&
  devDependencies?.tailwindcss

export const isDefaultReactProject = !!dependencies?.react
export const isDefaultVueProject = !!dependencies?.vue
export const isDefaultTSFrontProject =
  (isDefaultReactProject || isDefaultVueProject) && isDefaultTSProject

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
