import type { RuleSetRule } from 'webpack'

export const getRawLoader = (): RuleSetRule => {
  return {
    test: /\.txt$/,
    use: {
      loader: require.resolve('raw-loader')
    }
  }
}
