import type { RuleSetRule } from 'webpack'

export const getHtmlLoader = (): RuleSetRule => {
  return {
    test: /\.html$/,
    use: {
      loader: require.resolve('html-loader'),
      options: {
        // Disables attributes processing
        sources: false
      }
    }
  }
}
