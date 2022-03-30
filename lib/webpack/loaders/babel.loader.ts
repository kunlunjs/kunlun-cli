import type { RuleSetRule } from 'webpack'
import { getBabelConfig } from '../configs/babel.config'

export const getBabelLoader = ({
  isEnvDevelopment
}: {
  isEnvDevelopment?: boolean
}): RuleSetRule => {
  const babel = {}
  return {
    test: /\.(mjs|[jt]sx?)$/,
    exclude: [/node_modules/],
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        cacheDirectory: true,
        cacheCompression: false,
        compact: !isEnvDevelopment,
        ...getBabelConfig({
          isEnvDevelopment
        }),
        ...babel
      }
    }
  }
}
