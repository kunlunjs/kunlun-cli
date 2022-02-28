import type { RuleSetRule } from 'webpack'

export const getSVGLoader = (): RuleSetRule => {
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
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
    ],
    issuer: {
      and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
    }
  }
}
