import type { RuleSetRule } from 'webpack'

// https://react-svgr.com/docs/webpack/
export const getSVGLoaders = (): RuleSetRule[] => {
  // TODO: 深刻理解 @svgr/webpack 的使用
  return [
    // {
    //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    //   // type: 'asset/source' // 'asset/inline' 'asset' // https://webpack.docschina.org/guides/asset-modules/
    //   // resourceQuery: { not: [/url/] },
    //   use: [
    //     {
    //       loader: require.resolve('@svgr/webpack'),
    //       options: {
    //         // prettier: false,
    //         // ref: true,
    //         // semi: false,
    //         // svgo: false,
    //         // titleProp: true,
    //         // svgoConfig: {
    //         //   plugins: [{ removeViewBox: false }]
    //         // }
    //       }
    //     }
    //   ],
    //   issuer: /\.(mjs|[jt]sx?|mdx?)$/
    //   // issuer: {
    //   //   and: [/\.(ts|tsx|js|jsx|md|mdx)$/]
    //   // }
    // }
    {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      type: 'asset'
    }
    // {
    //   test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
    //   oneOf: [
    //     {
    //       use: [
    //         {
    //           loader: require.resolve('@svgr/webpack'),
    //           options: {
    //             prettier: false,
    //             svgo: true,
    //             svgoConfig: {
    //               plugins: [
    //                 {
    //                   name: 'preset-default',
    //                   params: {
    //                     overrides: {
    //                       removeTitle: false,
    //                       removeViewBox: false
    //                     }
    //                   }
    //                 }
    //               ]
    //             },
    //             titleProp: true,
    //             ref: ![path]
    //           }
    //         }
    //       ],
    //       issuer: {
    //         and: [/\.(?:tsx?|jsx?|mdx?)$/i]
    //       }
    //     }
    //   ]
    // }
  ]
}
