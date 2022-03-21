import type { RuleSetRule } from 'webpack'

export const getRawLoader = (): RuleSetRule => {
  return {
    resourceQuery: /\?raw$/,
    type: 'asset/source'
  }
}
