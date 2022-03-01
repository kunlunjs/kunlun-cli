import * as path from 'path'
import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import { getPackageJson } from '../../lib/utils/package'
import {
  defaultBabelPresetEnvOptions,
  isDefaultTSProject,
  isDefaultVueProject,
  isDefaultReactProject
} from '../defaults'

const dependencies = getPackageJson('dependencies')

export const getBabelConfig = (args: {
  isEnvDevelopment?: boolean
  isVueProject?: boolean
  isReactProject?: boolean
  isTSProject?: boolean
  // @babel/preset-env options
  presetEnv?: BabelPresetEnvOptions
  // babel-plugin-transform-remove-console options
  transformConsoleRemove?: false | { exclude: ('warn' | 'error')[] }
}) => {
  const {
    isEnvDevelopment,
    isReactProject = isDefaultReactProject,
    isVueProject = isDefaultVueProject,
    isTSProject = isDefaultTSProject,
    presetEnv = defaultBabelPresetEnvOptions,
    transformConsoleRemove = false // { exclude: ['warn', 'error'] }
  } = args
  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isEnvTest = env === 'test'
  return {
    presets: [
      [
        require('@babel/preset-env').default,
        isEnvTest
          ? {
              targets: {
                node: 'current'
              },
              exclude: []
            }
          : presetEnv
      ],
      isReactProject && [
        require('@babel/preset-react').default,
        {
          development: isEnvDevelopment,
          useBuiltIns: true,
          runtime: 'automatic'
        }
      ],
      isTSProject && require('@babel/preset-typescript').default
    ].filter(Boolean),

    plugins: [
      isVueProject && require('@vue/babel-plugin-jsx').default,
      !!dependencies?.['antd-mobile'] && [
        require('babel-plugin-import').default,
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'lib',
          style: true
        },
        'antd-mobile'
      ],
      !!dependencies?.antd && [
        require('babel-plugin-import').default,
        {
          libraryName: 'antd',
          libraryDirectory: 'lib',
          style: true
        },
        'antd'
      ],
      !!dependencies?.lodash && [
        require('babel-plugin-lodash').default,
        {
          libraryName: 'lodash',
          libraryDirectory: '',
          camel2DashComponentName: false
        },
        'lodash'
      ],
      isEnvDevelopment &&
        isReactProject &&
        require('react-refresh/babel').default,
      transformConsoleRemove === false
        ? require('babel-plugin-transform-remove-console').default
        : typeof transformConsoleRemove === 'object'
        ? [
            require('babel-plugin-transform-remove-console').default,
            transformConsoleRemove
          ]
        : false,
      require('babel-plugin-macros'),
      isTSProject && [
        require('@babel/plugin-proposal-decorators').default,
        false
      ],
      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        require('@babel/plugin-transform-runtime').default,
        {
          corejs: false,
          helpers: true, // areHelpersEnabled,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: require('@babel/runtime/package.json').version,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: true,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: path.dirname(
            require.resolve('@babel/runtime/package.json')
          ) //absoluteRuntimePath
        }
      ],
      !isEnvDevelopment && [
        // Remove PropTypes from production build
        require('babel-plugin-transform-react-remove-prop-types').default,
        {
          removeImport: true
        }
      ]
    ].filter(Boolean),
    overrides: [],
    sourceMaps: true
  }
}
