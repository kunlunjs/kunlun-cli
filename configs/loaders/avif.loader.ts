import type { Rule } from '../types'

export const getAvifLoader = ({
  imageInlineSizeLimit = parseInt(
    process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
  )
}: { imageInlineSizeLimit?: number } = {}): Rule => {
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
