import type { RuleSetRule } from 'webpack'
import { getStyleLoaders } from './style.loader'
import { getCSSModuleLoader } from '.'

export const getSassLoader = ({
  isEnvDevelopment,
  useSourceMap
}: {
  isEnvDevelopment?: boolean
  useSourceMap?: boolean
} = {}): RuleSetRule => {
  return {
    test: /\.s[ac]ss$/,
    exclude: /\.module\.s[ac]ss$/,
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
        loader: 'sass-loader'
      }
    )
  }
}

export const getSassModuleLoader = ({
  isEnvDevelopment,
  useSourceMap
}: {
  isEnvDevelopment?: boolean
  useSourceMap?: boolean
} = {}): RuleSetRule => {
  return {
    test: /\.module\.s[ac]ss$/,
    use: getStyleLoaders(
      {
        isEnvDevelopment,
        useSourceMap,
        cssOptions: {
          useSourceMap,
          importLoaders: 3,
          modules: {
            mode: 'local',
            getLocalIdent: getCSSModuleLoader
          }
        }
      },
      {
        loader: 'sass-loader'
      }
    )
  }
}
