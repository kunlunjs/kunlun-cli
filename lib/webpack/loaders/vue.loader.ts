import type { RuleSetRule } from 'webpack'
import type { VueLoaderOptions } from '../types'

export const getVueLoader = (options?: VueLoaderOptions): RuleSetRule => {
  return {
    test: /\.vue$/,
    use: {
      loader: require.resolve('vue-loader'),
      options
    }
  }
}
