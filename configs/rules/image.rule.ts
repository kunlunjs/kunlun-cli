import type { Rule } from '../types'

export const getImageRule = (): Rule => {
  return {
    test: /\.(ico|gif|png|jpe?g|bmp)$/i,
    type: 'asset/resource'
  }
}
