import * as path from 'path'
import {
  defaultBabelPresetEnvOptions,
  isDefaultDevelopment,
  isDefaultTypeScriptProject,
  isDefaultTypeScriptReactProject
} from '../defaults'
import type { BabelPresetEnvOptions } from '../types'
const dependencies = require(path.resolve(
  process.cwd(),
  'package.json'
)).dependencies

export const getBabelConfig = (
  args: {
    isDevelopment?: boolean
    isReactProject?: boolean
    isTypeScriptProject?: boolean
    // @babel/preset-env 配置项
    env?: BabelPresetEnvOptions
    // babel-plugin-transform-remove-console 配置项
    consoleRemove?: false | { exclude: ('warn' | 'error')[] }
  } = {}
) => {
  const {
    isDevelopment = isDefaultDevelopment,
    isReactProject = isDefaultTypeScriptReactProject,
    isTypeScriptProject = isDefaultTypeScriptProject,
    env = defaultBabelPresetEnvOptions,
    consoleRemove = false // { exclude: ['warn', 'error'] }
  } = args
  return {
    presets: [
      ['@babel/preset-env', env],
      // Enable development transform of React with new automatic runtime
      isReactProject && [
        '@babel/preset-react',
        { development: isDevelopment, runtime: 'automatic' }
      ],
      isTypeScriptProject && '@babel/preset-typescript'
    ].filter(Boolean),

    plugins: [
      !!dependencies.antd && [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'lib',
          style: true
        },
        'antd'
      ],
      !!dependencies.lodash && [
        'import',
        {
          libraryName: 'lodash',
          libraryDirectory: '',
          camel2DashComponentName: false
        },
        'lodash'
      ],
      // Applies the react-refresh Babel plugin on non-production modes only
      isDevelopment && isReactProject && 'react-refresh/babel',
      consoleRemove === false
        ? 'transform-remove-console'
        : typeof consoleRemove === 'object'
        ? ['transform-remove-console', consoleRemove]
        : false
    ].filter(Boolean),
    overrides: [],
    sourceMaps: true
  }
}
