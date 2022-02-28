import type { RuleSetRule } from 'webpack'
import { getStyleLoaders } from './style.loader'
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')

export const getCSSLoader = ({
  isEnvDevelopment,
  useSourceMap
}: {
  isEnvDevelopment?: boolean
  useSourceMap?: boolean
} = {}): RuleSetRule => {
  return {
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: getStyleLoaders({
      isEnvDevelopment,
      useSourceMap,
      cssOptions: {
        importLoaders: 1,
        sourceMap: useSourceMap,
        modules: {
          mode: 'icss'
        }
      }
    }),
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true
  }
}

export const getCSSModuleLoader = ({
  isEnvDevelopment,
  useSourceMap
}: {
  isEnvDevelopment?: boolean
  useSourceMap?: boolean
} = {}): RuleSetRule => {
  return {
    test: /\.module\.css$/,
    use: getStyleLoaders({
      isEnvDevelopment,
      useSourceMap,
      cssOptions: {
        importLoaders: 1,
        modules: {
          mode: 'local',
          sourceMap: useSourceMap,
          getLoalIdent: getCSSModuleLocalIdent
        }
      }
    })
  }
}
