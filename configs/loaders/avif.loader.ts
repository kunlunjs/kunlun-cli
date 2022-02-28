import type { RuleSetRule } from 'webpack'

export const getAvifLoader = ({
  imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
  )
}: { imageInlineSizeLimit?: number } = {}): RuleSetRule => {
  // TODO: Merge this config once `image/avif` is in the mime-db
  // https://github.com/jshttp/mime-db
  return {
    test: /\.avif$/,
    type: 'asset',
    mimetype: 'image/avif',
    parser: {
      defaultUrlCondition: {
        maxSize: imageInlineSizeLimit
      }
    }
  }
}
