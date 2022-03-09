import { defineConfig } from '@kunlunjs/cli'
// import { defineConfig } from '../../lib'

// @ts-check
export default defineConfig({
  start: {
    loaders: {
      less: {
        modifyVars: {},
        globalVars: {}
      }
    },
    devServer: {
      proxy: {
        '/api': {
          target: process.env.PROXY_URL || 'http://localhost:3000'
        }
      }
    }
  }
})
