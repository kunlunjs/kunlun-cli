import * as path from 'path'
import type { Options as BabelPresetEnvOptions } from '@babel/preset-env'
import { getPackageJson } from '../../lib/utils/package'
import {
  defaultBabelPresetEnvOptions,
  isDefaultTypeScriptProject,
  isDefaultVueProject,
  isDefaultReactProject,
  isDefaultEnvDevelopment
} from '../defaults'

const dependencies = getPackageJson('dependencies')

export const getBabelConfig = (
  args: {
    isEnvDevelopment: boolean
    isVueProject?: boolean
    isReactProject?: boolean
    isTypeScriptProject?: boolean
    env?: BabelPresetEnvOptions
    // babel-plugin-transform-remove-console 配置项
    consoleRemove?: false | { exclude: ('warn' | 'error')[] }
  } = { isEnvDevelopment: isDefaultEnvDevelopment }
) => {
  const {
    isEnvDevelopment,
    isReactProject = isDefaultReactProject,
    isVueProject = isDefaultVueProject,
    isTypeScriptProject = isDefaultTypeScriptProject,
    env = defaultBabelPresetEnvOptions,
    consoleRemove = false // { exclude: ['warn', 'error'] }
  } = args
  return {
    presets: [
      [require('@babel/preset-env').default, env],
      // Enable development transform of React with new automatic runtime
      isReactProject && [
        require('@babel/preset-react').default,
        {
          development: isEnvDevelopment,
          useBuiltIns: true,
          runtime: 'automatic'
        }
      ],
      isTypeScriptProject && require('@babel/preset-typescript').default
    ].filter(Boolean),

    plugins: [
      isVueProject && '@vue/babel-plugin-jsx',
      !!dependencies?.['antd-mobile'] && [
        'import',
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'lib',
          style: true
        },
        'antd-mobile'
      ],
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
      isEnvDevelopment && isReactProject && 'react-refresh/babel',
      consoleRemove === false
        ? 'transform-remove-console'
        : typeof consoleRemove === 'object'
        ? ['transform-remove-console', consoleRemove]
        : false,
      // class { handleClick = () => { } }
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      // Note:
      // 'loose' mode configuration must be the same for
      // * @babel/plugin-proposal-class-properties
      // * @babel/plugin-proposal-private-methods
      // * @babel/plugin-proposal-private-property-in-object
      // (when they are enabled)
      [
        require('@babel/plugin-proposal-class-properties').default,
        {
          loose: true
        }
      ],
      [
        require('@babel/plugin-proposal-private-methods').default,
        {
          loose: true
        }
      ],
      [
        require('@babel/plugin-proposal-private-property-in-object').default,
        {
          loose: true
        }
      ],
      // Adds Numeric Separators
      require('@babel/plugin-proposal-numeric-separator').default,
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
      ],
      // Optional chaining and nullish coalescing are supported in @babel/preset-env,
      // but not yet supported in webpack due to support missing from acorn.
      // These can be removed once webpack has support.
      // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
      require('@babel/plugin-proposal-optional-chaining').default,
      require('@babel/plugin-proposal-nullish-coalescing-operator').default
    ].filter(Boolean),
    overrides: [],
    sourceMaps: true
  }
}
