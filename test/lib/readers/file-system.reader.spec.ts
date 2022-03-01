import fs from 'fs'
import { paths } from '../../../configs/defaults'
import type { Reader } from '../../../lib/readers'
import { FileSystemReader } from '../../../lib/readers'

jest.mock('fs', () => {
  return {
    existsSync: jest.fn(() => ''),
    realpathSync: jest.fn(() => ''),
    readdir: jest.fn((dir, callback) => callback(null, [])),
    readFile: jest.fn((filename, callback) => callback(null, 'content'))
  }
})

const dir: string = paths.root
const reader: Reader = new FileSystemReader(dir)

describe('File System Reader', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })
  it('should use fs.readdir when list', async () => {
    await reader.list()
    expect(fs.readdir).toHaveBeenCalled()
  })
  it('should use fs.readFile when read', async () => {
    await reader.read('filename')
    expect(fs.readFile).toHaveBeenCalled()
  })

  describe('readAnyOf tests', () => {
    it('should call readFile when running readAnyOf fn', async () => {
      const filenames: string[] = ['file1', 'file2', 'file3']
      await reader.readAnyOf(filenames)

      expect(fs.readFile).toHaveBeenCalled()
    })

    it('should return null when no file is passed', async () => {
      const content = await reader.readAnyOf([])
      expect(content).toEqual(undefined)
    })
  })
})
