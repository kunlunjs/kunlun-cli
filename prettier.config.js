// @ts-nocheck
const prettierConfig = require('@kunlunjs/fabric/dist/prettier')

/**
 * @type {import('prettier').Config}
 * @see https://github.com/kunlunjs/kunlun-fabric/blob/main/src/prettier.ts
 */
module.exports = {
  ...prettierConfig
  // tailwindConfig: '<path to>/tailwind.config.js'
}
