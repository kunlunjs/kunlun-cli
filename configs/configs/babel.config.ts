import { getPackageJson } from '../../lib/utils/package'
import {
  defaultBabelPresetEnvOptions,
  isDefaultDevelopment,
  isDefaultTypeScriptProject,
  isDefaultVueProject,
  isDefaultReactProject
} from '../defaults'
import type { BabelPresetEnvOptions } from '../types'

const dependencies = getPackageJson('dependencies')

export const getBabelConfig = (
  args: {
    isDevelopment?: boolean
    isVueProject?: boolean
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
    isReactProject = isDefaultReactProject,
    isVueProject = isDefaultVueProject,
    isTypeScriptProject = isDefaultTypeScriptProject,
    env = defaultBabelPresetEnvOptions,
    consoleRemove = false // { exclude: ['warn', 'error'] }
  } = args
  return {
    presets: [
      ['@babel/preset-env', {}],
      // Enable development transform of React with new automatic runtime
      isReactProject && [
        '@babel/preset-react',
        { development: isDevelopment, useBuiltIns: true, runtime: 'automatic' }
      ],
      isTypeScriptProject && '@babel/preset-typescript'
    ].filter(Boolean),

    plugins: [
      isVueProject && '@vue/babel-plugin-jsx',
      !!dependencies?.antd && [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'lib',
          style: true
        },
        'antd'
      ],
      !!dependencies?.lodash && [
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
