import type { RuleSetRule } from 'webpack'

export const getWorkerLoader = (): RuleSetRule => {
  return {
    test: /\.worker\.[jt]s$/,
    use: {
      loader: require.resolve('worker-loader')
    }
  }
}
