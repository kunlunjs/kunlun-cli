import { existsSync } from 'fs'
import { resolve } from 'path'

export function loadEnv(env: 'development' | 'production') {
  const isEnvExist = existsSync(resolve(process.cwd(), '.env'))
  if (/*!process.env.NODE_ENV && */ !isEnvExist) {
    require('dotenv').config({
      path: resolve(__dirname, `../../.env.${env}`)
    })
  } else if (isEnvExist) {
    require('dotenv').config({
      path: resolve(process.cwd(), '.env')
    })
  }
}
