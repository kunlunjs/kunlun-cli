const { defineConfig } = require('@kunlunjs/cli')

// @ts-check
module.exports = defineConfig({
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
