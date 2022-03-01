import type { Configuration } from 'webpack-dev-server'
import { isTypeScriptFrontProject } from './defaults'

export const getDevServerConfig = (args: Configuration = {}): Configuration => {
  const {
    port = process.env.PORT || 8000,
    hot = isTypeScriptFrontProject,
    open = isTypeScriptFrontProject,
    historyApiFallback = isTypeScriptFrontProject,
    proxy = {},
    compress = false
  } = args
  return {
    port,
    hot,
    open,
    proxy,
    compress,
    /**
     * 可以额外指定静态文件目录
     * @relativePath
     * @optional
     * @default public
     */
    // static: path.resolve(__dirname, 'dist'),
    client: {
      logging: 'verbose'
    },
    // 不存在路径重定向到 index.html
    historyApiFallback,
    // 监听文件变化
    // watchFiles: {
    //   paths: ['src/**/*', 'public/**/*']
    // },
    devMiddleware: {
      /**
      * @example
      *   detailed 相比 verbose 在 LOG from webpack.Compiler 上面多了 runtime modules 26.2 KiB
      *   verbose 会输出
      *     <i> [webpack-dev-server] Project is running at:
            <i> [webpack-dev-server] Loopback: http://localhost:8000/
            <i> [webpack-dev-server] On Your Network (IPv4): http://192.168.204.108:8000/
            <i> [webpack-dev-server] On Your Network (IPv6): http://[fe80::1]:8000/
            <i> [webpack-dev-server] Content not from webpack is served from '/Users/turing/Desktop/Code/Turing-FE/weekly/examples/webpack/typescript-with-ts-loader/public' directory
            <i> [webpack-dev-server] 404s will fallback to '/index.html'
            <i> [webpack-dev-middleware] wait until bundle finished: /
            PublicPath: auto
            asset bundle.js 254 KiB {main} [emitted] (name: main)
            Entrypoint main 254 KiB = bundle.js
            chunk {main} (runtime: main) bundle.js (main) 27 KiB (runtime) 163 KiB (javascript) [entry] [rendered]
              ...
      *     LOG from webpack.Compiler
      *     LOG from webpack.Compilation
      *     LOG from webpack.ResolverCachePlugin
      *     LOG from webpack.FlagDependencyExportsPlugin
      *     LOG from webpack.SideEffectsFlagPlugin
      *     LOG from webpack.buildChunkGraph
      *     LOG from webpack.SplitChunksPlugin
      *     LOG from webpack.FileSystemInfo
      *     LOG from webpack.Watching
      *     2022-01-20 14:01:53: webpack 5.66.0 compiled successfully in 1596 ms (376ff8f3cdf2baf13e60)
      *   normal
      *   minimal
      *   summary
      *   errors-only
      *   errors-warnings
      *   none
      *
      */
      stats: {
        // modules: true,
        // chunks: true
        // chunkRelations: true
      }, // 'errors-warnings',
      /**
       * filePath 生成文件完整路径
       * @default
       *   main.{20位hash}.hot-update.js
       *   main.{20位hash}.hot-update.json
       */
      writeToDisk: filePath => {
        return (
          !/hot-update\.js(on)?$/.test(filePath) && !/\.map$/.test(filePath)
        )
      }
    }
  }
}
