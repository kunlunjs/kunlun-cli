import type { RuleSetRule } from 'webpack'
import type { MdxLoaderOptions } from '../types'

export const getMdxLoader = (options?: MdxLoaderOptions): RuleSetRule => {
  return {
    test: /\.mdx?$/,
    use: {
      loader: require.resolve('@mdx-js/loader'),
      /** @type {import('@mdx-js/loader').Options}  */
      options: {}
    }
  }
}
