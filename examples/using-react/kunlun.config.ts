import { defineConfig } from '@kunlunjs/cli'

export default defineConfig({
  start: {
    loaders: {
      less: {
        modifyVars: {},
        globalVars: {}
      }
    },
    // plugins: {},
    devServer: {
      proxy: {
        '/api': {
          target: process.env.PROXY_URL || 'http://localhost:3000'
        }
      }
    }
  }
})