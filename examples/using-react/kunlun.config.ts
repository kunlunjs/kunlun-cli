import { defineConfig } from '@kunlunjs/cli'

export default defineConfig({
  start: {
    devServer: {
      proxy: {
        '/api': {
          target: process.env.PROXY_URL || 'http://localhost:3000'
        }
      }
    }
  }
})
