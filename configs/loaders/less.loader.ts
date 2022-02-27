import type { Rule } from '../types'
import { getStyleLoaders } from './style.loader'
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')

export const getLessLoader = (
  args: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
    strictMath?: boolean
    ieCompat?: boolean
    javascriptEnabled?: boolean
    globalVars?: Record<string, string>
    modifyVars?: Record<string, string>
    urlArgs?: string
  } = {}
): Rule => {
  const {
    isEnvDevelopment,
    useSourceMap,
    strictMath = false,
    ieCompat = false,
    javascriptEnabled = true,
    globalVars = {},
    modifyVars = {},
    urlArgs = ''
  } = args

  return {
    test: /\.less$/,
    exclude: /\.module.less$/,
    use: getStyleLoaders(
      {
        isEnvDevelopment,
        useSourceMap,
        cssOptions: {
          importLoaders: 3,
          sourceMap: useSourceMap,
          modules: {
            mode: 'icss'
          }
        }
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: useSourceMap,
          lessOptions: {
            strictMath,
            ieCompat,
            javascriptEnabled,
            globalVars,
            modifyVars
            // urlArgs: ''
          }
        }
      }
    ),
    sideEffects: true
  }
}

export const getLessModuleLoader = (
  args: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
    strictMath?: boolean
    ieCompat?: boolean
    javascriptEnabled?: boolean
    globalVars?: Record<string, string>
    modifyVars?: Record<string, string>
  } = {}
): Rule => {
  const {
    isEnvDevelopment,
    useSourceMap,
    strictMath,
    ieCompat,
    javascriptEnabled,
    globalVars = {},
    modifyVars = {}
  } = args

  return {
    test: /\.module\.less$/,
    use: getStyleLoaders(
      {
        isEnvDevelopment,
        useSourceMap,
        cssOptions: {
          importLoaders: 3,
          sourceMap: useSourceMap,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent
          }
        }
      },
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            strictMath,
            ieCompat,
            javascriptEnabled,
            globalVars,
            modifyVars
          }
        }
      }
    )
  }
}
