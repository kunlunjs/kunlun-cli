import type { RuleSetRule } from 'webpack'
import { getCSSModuleLocalIdent } from '../helpers'
import { getStyleLoaders } from './style.loader'

// TODO: @types/less
type LessOptions = {
  globalVars?:
    | {
        [key: string]: string
      }
    | undefined
  /** Puts Var declaration at the end of base file. */
  modifyVars?:
    | {
        [key: string]: string
      }
    | undefined
}

export const getLessLoader = (
  args: {
    isEnvDevelopment?: boolean
    useSourceMap?: boolean
  } & LessOptions = {}
): RuleSetRule => {
  const {
    isEnvDevelopment,
    useSourceMap,
    globalVars = {},
    modifyVars = {},
    ...rest
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
            ...rest,
            globalVars,
            modifyVars
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
  } & LessOptions = {}
): RuleSetRule => {
  const {
    isEnvDevelopment,
    useSourceMap,
    globalVars = {},
    modifyVars = {},
    ...rest
  } = args

  return {
    test: /\.module\.less$/,
    use: getStyleLoaders(
      {
        isEnvDevelopment,
        useSourceMap,
        cssOptions: {
          importLoaders: 3,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLocalIdent
          }
        }
      },
      {
        loader: 'less-loader',
        options: {
          sourceMap: useSourceMap,
          lessOptions: {
            ...rest,
            globalVars,
            modifyVars
          }
        }
      }
    )
  }
}
