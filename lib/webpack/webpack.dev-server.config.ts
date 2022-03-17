import type { Configuration } from 'webpack-dev-server'
import { isTypeScriptFrontProject, paths } from './defaults'
import { ignoredFiles } from './helpers'

export const getDevServerConfig = (args: Configuration = {}): Configuration => {
  const {
    port,
    hot = isTypeScriptFrontProject,
    client,
    headers,
    proxy = {},
    devMiddleware,
    compress = true,
    allowedHosts = 'all',
    open = isTypeScriptFrontProject,
    historyApiFallback = isTypeScriptFrontProject,
    ...rest
  } = args

  const {
    WDS_SOCKET_HOST = process.env.HOST || '0.0.0.0',
    WDS_SOCKET_PORT = port,
    WDS_SOCKET_PATH = '/ws'
  } = process.env

  let wdsHostname = WDS_SOCKET_HOST
  let wdsPort = WDS_SOCKET_PORT
  let wdsPathname = WDS_SOCKET_PATH
  if (typeof client === 'object' && typeof client.webSocketURL === 'object') {
    if (client?.webSocketURL?.hostname) {
      wdsHostname = client?.webSocketURL?.hostname
    }
    if (client?.webSocketURL?.port) {
      wdsPort = client?.webSocketURL?.port
    }
    if (client?.webSocketURL?.pathname) {
      wdsPathname = client?.webSocketURL?.pathname
    }
  }

  return {
    ...rest,
    port,
    hot,
    open,
    proxy,
    compress,
    allowedHosts,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      ...headers
    },
    // TODO
    // https: getHttsConfig(),
    /**
     * 可以额外指定静态文件目录
     * @relativePath
     * @optional
     * @default public
     */
    static: args.static || {
      directory: paths.public,
      publicPath: [paths.publicUrlOrPath],
      watch: {
        ignored: ignoredFiles()
      },
      ...(typeof args?.static === 'object' ? args.static : {})
    },
    client: client || {
      logging: 'verbose',
      webSocketURL: {
        hostname: wdsHostname,
        pathname: wdsPathname,
        port: wdsPort
      },
      ...(typeof client === 'object' ? client : {})
    },
    historyApiFallback: historyApiFallback || {
      disableDotRule: true,
      index: paths.publicUrlOrPath,
      ...(typeof historyApiFallback === 'object' ? historyApiFallback : {})
    },
    devMiddleware: {
      publicPath: paths.publicUrlOrPath.slice(0, 1),
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
      // stats: 'none', //'errors-warnings',
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
      },
      ...devMiddleware
    }
  }
}
