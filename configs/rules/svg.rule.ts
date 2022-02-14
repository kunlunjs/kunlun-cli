import type { Rule } from '../types'

export const getSVGRule = (): Rule => {
  return {
    test: /\.svg/,
    type: 'asset/source' // 'asset/inline'
  }
}
