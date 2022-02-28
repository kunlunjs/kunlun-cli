import { existsSync } from 'fs'
import { resolve } from 'path'
import { paths } from '../../configs/defaults'

export function loadEnv(env: 'development' | 'production') {
  const isEnvExist = existsSync(resolve(paths.root, '.env'))
  if (/*!process.env.NODE_ENV && */ !isEnvExist) {
    require('dotenv').config({
      path: resolve(__dirname, `../../.env.${env}`)
    })
  } else if (isEnvExist) {
    require('dotenv').config({
      path: resolve(paths.root, '.env')
    })
  }
}
