import type { RuleSetRule } from 'webpack'

export const getSWCLoader = (): RuleSetRule => {
  return {
    test: /\.(mjs|[jt]sx?)$/,
    exclude: [/node_modules/],
    use: {
      loader: require.resolve('swc-loader'),
      options: {}
    }
  }
}
