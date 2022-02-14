import type { Rule } from '../types'

export const getFontRule = (): Rule => {
  return {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    type: 'asset/inline'
  }
}
