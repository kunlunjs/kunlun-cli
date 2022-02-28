import { getBabelConfig } from '../configs/babel.config'
import type { Rule } from '../types'

export const getBabelLoader = ({
  isEnvDevelopment
}: {
  isEnvDevelopment?: boolean
}): Rule => {
  const babel = {}
  return {
    test: /\.(mjs|[jt]sx?)$/,
    exclude: [/node_modules/],
    use: {
      loader: require.resolve('babel-loader'),
      options: {
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
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
