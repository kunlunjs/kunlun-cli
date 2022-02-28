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
  presetEnv?: BabelPresetEnvOptions
  // babel-plugin-transform-remove-console 配置项
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
              // Exclude transforms that make all code slower
              exclude: ['transform-typeof-symbol']
            }
          : presetEnv
      ],
      // Enable development transform of React with new automatic runtime
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
      // Applies the react-refresh Babel plugin on non-production modes only
      // isEnvDevelopment &&
      //   isReactProject &&
      //   require('react-refresh/babel').default,
      transformConsoleRemove === false
        ? require('babel-plugin-transform-remove-console').default
        : typeof transformConsoleRemove === 'object'
        ? [
            require('babel-plugin-transform-remove-console').default,
            transformConsoleRemove
          ]
        : false,
      // Experimental macros support. Will be documented after it's had some time
      // in the wild.
      require('babel-plugin-macros'),
      // Disabled as it's handled automatically by preset-env, and `selectiveLoose` isn't
      // yet merged into babel: https://github.com/babel/babel/pull/9486
      // Related: https://github.com/facebook/create-react-app/pull/8215
      // [
      //   require('@babel/plugin-transform-destructuring').default,
      //   {
      //     // Use loose mode for performance:
      //     // https://github.com/facebook/create-react-app/issues/5602
      //     loose: false,
      //     selectiveLoose: [
      //       'useState',
      //       'useEffect',
      //       'useContext',
      //       'useReducer',
      //       'useCallback',
      //       'useMemo',
      //       'useRef',
      //       'useImperativeHandle',
      //       'useLayoutEffect',
      //       'useDebugValue',
      //     ],
      //   },
      // ],
      // Turn on legacy decorators for TypeScript files
      isTSProject && [
        require('@babel/plugin-proposal-decorators').default,
        false
      ],
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
      // Disabled as it's handled automatically by preset-env, and `selectiveLoose` isn't
      // yet merged into babel: https://github.com/babel/babel/pull/9486
      // Related: https://github.com/facebook/create-react-app/pull/8215
      // [
      //   require('@babel/plugin-transform-destructuring').default,
      //   {
      //     // Use loose mode for performance:
      //     // https://github.com/facebook/create-react-app/issues/5602
      //     loose: false,
      //     selectiveLoose: [
      //       'useState',
      //       'useEffect',
      //       'useContext',
      //       'useReducer',
      //       'useCallback',
      //       'useMemo',
      //       'useRef',
      //       'useImperativeHandle',
      //       'useLayoutEffect',
      //       'useDebugValue',
      //     ],
      //   },
      // ],
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
