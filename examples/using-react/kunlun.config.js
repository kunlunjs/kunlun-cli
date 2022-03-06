import { defineConfig } from '@kunlunjs/cli'

// @ts-check
export default defineConfig({
  start: {
    loaders: {
      less: {
        modifyVars: {},
        globalVars: {}
      }
    },
    plugins: {},
    devServer: {
      proxy: {
        '/api': {
          target: process.env.PROXY_URL || 'http://localhost:3000'
        }
      }
    }
  }
})
