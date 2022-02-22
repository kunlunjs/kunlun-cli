import AutoPrefixer from 'autoprefixer'
import CssNano from 'cssnano'
import type { Plugin } from 'postcss'
import Nested from 'postcss-nested'

export const getPostCSSConfig: (args: {
  isDevelopment?: boolean
}) => Plugin[] = ({ isDevelopment = true }) => {
  return [AutoPrefixer(), Nested(), isDevelopment && CssNano()].filter(Boolean)
}
