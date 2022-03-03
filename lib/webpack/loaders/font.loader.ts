import type { RuleSetRule } from 'webpack'

export const getFontLoader = (): RuleSetRule => {
  return {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    type: 'asset/inline'
  }
}
