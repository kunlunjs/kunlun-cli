import type { RuleSetRule } from 'webpack'

export const getSVGLoader = (): RuleSetRule => {
  // TODO: 深刻理解 @svgr/webpack 的使用
  return {
    test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    // type: 'asset/source' // 'asset/inline'
    // resourceQuery: { not: [/url/] },
    use: [
      {
        loader: require.resolve('@svgr/webpack'),
        options: {
          prettier: false,
          ref: true,
          semi: false,
          svgo: false,
          titleProp: true,
          svgoConfig: {
            plugins: [{ removeViewBox: false }]
          }
        }
      }
    ],
    issuer: /\.(mjs|[jt]sx?|mdx?)$/
    // issuer: {
    //   and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
    // }
  }
}
