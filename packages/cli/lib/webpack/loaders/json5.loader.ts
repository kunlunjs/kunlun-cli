import type { RuleSetRule } from 'webpack'

export const getJson5Loader = (): RuleSetRule => {
  return {
    test: /\.json5$/,
    use: {
      loader: require.resolve('json5-loader')
    }
  }
}
