import { existsSync, realpathSync } from 'fs'
import { resolve } from 'path'
import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import type { Configuration } from 'webpack'
import { getPackageJson } from '../lib/utils/package'
import { getPublicUrlOrPath } from './helpers'

const root = realpathSync(process.cwd())

export const paths = {
  root,
  src: resolve(root, 'src'),
  public: resolve(root, 'public'),
  html: resolve(root, 'public/index.html'),
  publicUrlOrPath: getPublicUrlOrPath(
    process.env.NODE_ENV === 'development',
    getPackageJson('homepage'),
    process.env.PUBLIC_URL
  ) as string,
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

export const isTypeScriptProject = existsSync(
  resolve(paths.root, 'tsconfig.json')
)

export const isExistWindiCSS = existsSync(resolve(root, 'windi.config.js'))

export const isExistTailwindCSS =
  existsSync(resolve(root, 'tailwind.config.js')) &&
  devDependencies?.tailwindcss

export const isReactProject = !!dependencies?.react
export const isVueProject = !!dependencies?.vue
export const isExistAntd = !!dependencies?.antd
export const isTypeScriptFrontProject =
  (isReactProject || isVueProject) && isTypeScriptProject

export const extensions = [
  '.wasm',
  '.web.mjs',
  '.mjs',
  '.web.js',
  '.js',
  '.web.jsx',
  '.jsx',
  '.web.ts',
  '.ts',
  '.d.ts',
  '.web.tsx',
  '.tsx'
]

// @see https://webpack.js.org/configuration/stats/
export const defaultStats: Configuration['stats'] = {
  preset: 'none',
  moduleTrace: true,
  warnings: true,
  errorDetails: true
}

export const defaultProductionStats: Configuration['stats'] = {
  preset: 'none',
  assets: true,
  chunks: true,
  modules: true,
  moduleTrace: true,
  runtimeModules: true,
  warnings: true,
  errorStack: true,
  errorDetails: true
}
