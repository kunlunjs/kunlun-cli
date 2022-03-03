import type { RuleSetRule } from 'webpack'

export const getImageLoader = (): RuleSetRule => {
  return {
    test: /\.(ico|gif|png|jpe?g|bmp)$/i,
    type: 'asset/resource'
  }
}
