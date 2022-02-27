import type { Rule } from '../types'

export const getSVGLoader = (): Rule => {
  return {
    test: /\.svg$/,
    // type: 'asset/source' // 'asset/inline'
    use: [
      {
        loader: require.resolve('@svgr/webpack'),
        options: {
          prettier: false,
          svgo: false,
          svgoConfig: {
            plugins: [{ removeViewBox: false }]
          },
          titleProp: true,
          ref: true
        }
      },
      {
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash].[ext]'
        }
      }
    ],
    issuer: {
      and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
    }
  }
}
