import type { Rule } from '../types'

export const getSVGLoader = (): Rule => {
  return {
    test: /\.svg/,
    type: 'asset/source' // 'asset/inline'
  }
}
