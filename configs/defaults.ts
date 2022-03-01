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

export const defaultStats: Configuration['stats'] = {
  assets: false,
  cachedAssets: false,
  cachedModules: false,
  runtimeModules: false,
  children: false,
  chunks: false,
  chunkGroups: false,
  chunkModules: false,
  chunkOrigins: false,
  entrypoints: false,
  modules: false,
  moduleTrace: false,
  moduleAssets: false,
  runtime: false,
  reasons: false,
  timings: false,
  version: false
}
