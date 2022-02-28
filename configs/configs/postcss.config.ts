// Refer to https://awesomejs.dev/for/postcss/
import type { Plugin } from 'postcss'
import { isExistTailwindCSS } from '../defaults'

export const getPostCSSConfig: (args: {
  isEnvDevelopment?: boolean
  useTailwindCSS?: boolean
}) => Plugin[] = ({
  isEnvDevelopment,
  useTailwindCSS = isExistTailwindCSS
}) => {
  return !useTailwindCSS
    ? [
        require('postcss-flexbugs-fixes'),
        [
          require('postcss-preset-env'),
          {
            autoprefixer: {
              flexbox: 'no-2019'
            },
            stage: 3
          }
        ],
        // Adds PostCSS Normalize as the reset css with default options,
        // so that it honors browserslist config in package.json
        // which in turn let's users customize the target behavior as per their needs.
        require('postcss-normalize'),
        require('postcss-nested'),
        isEnvDevelopment && require('cssnano')
      ].filter(Boolean)
    : [
        require('tailwindcss'),
        require('postcss-flexbugs-fixes'),
        [
          require('postcss-preset-env'),
          {
            autoprefixer: {
              flexbox: 'no-2019'
            },
            stage: 3
          }
        ],
        require('postcss-nested'),
        isEnvDevelopment && require('cssnano')
      ].filter(Boolean)
}
