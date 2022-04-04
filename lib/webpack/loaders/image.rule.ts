import type { RuleSetRule } from 'webpack'

export const getImageLoader = (): RuleSetRule => {
  return {
    test: /\.(ico|gif|png|jpe?g|bmp)$/i,
    // dependency: { not: ['url'] },
    type: 'asset/resource'
  }
}
