// Refer to https://awesomejs.dev/for/postcss/
import type { Plugin } from 'postcss'

export const getPostCSSConfig: (args: {
  isDevelopment?: boolean
}) => Plugin[] = ({ isDevelopment = true }) => {
  return [
    require('autoprefixer'),
    require('postcss-nested'),
    isDevelopment && require('cssnano')
  ].filter(Boolean)
}
