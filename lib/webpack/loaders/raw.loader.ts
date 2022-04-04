import type { RuleSetRule } from 'webpack'

export const getRawLoader = (): RuleSetRule => {
  /**
   *  增加如下代码到项目类型声明中
      declare module '!!raw!*' {
        const content: { default: string }
        export = content
      }
   */
  return {
    // 以 raw! 或 raw-loader! 开头，或以 ?raw 或 ?raw-loader 结尾
    // test: /^!!raw(-loader)?!|\?raw(-loader)?$/,
    realResource: /^!!raw!|\?raw$/,
    type: 'asset/source'
  }
}
