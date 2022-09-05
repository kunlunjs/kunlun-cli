import type { RuleSetRule } from 'webpack'

export const getAssetLoader = (): RuleSetRule => {
  return {
    test: /\.(woff2?|eot|ttf|otf|appcache|mp4|pdf)(\?.*)?$/,
    type: 'asset/resource'
  }
}
