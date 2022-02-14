import type { AbstractRunner } from '../../../lib/runners'
import { KunlunCollection } from '../../../lib/schematics/kunlun.collection'

describe('Kunlun Collection', () => {
  ;['application'].forEach(schematic => {
    it(`should call runner with ${schematic} schematic name`, async () => {
      const mock = jest.fn()
      mock.mockImplementation(() => {
        return {
          logger: {},
          run: jest.fn().mockImplementation(() => Promise.resolve())
        }
      })
      const mockedRunner = mock()
      const collection = new KunlunCollection(mockedRunner as AbstractRunner)
      await collection.execute(schematic, [])
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@kunlunjs/schematics:${schematic}`
      )
    })
  })
  ;[{ name: 'application', alias: 'application' }].forEach(schematic => {
    it(`should call runner with schematic ${schematic.name} name when use ${schematic.alias} alias`, async () => {
      const mock = jest.fn()
      mock.mockImplementation(() => {
        return {
          logger: {},
          run: jest.fn().mockImplementation(() => Promise.resolve())
        }
      })
      const mockedRunner = mock()
      const collection = new KunlunCollection(mockedRunner as AbstractRunner)
      await collection.execute(schematic.alias, [])
      expect(mockedRunner.run).toHaveBeenCalledWith(
        `@kunlunjs/schematics:${schematic.name}`
      )
    })
  })
  it('should throw an error when schematic name is not in nest collection', async () => {
    const mock = jest.fn()
    mock.mockImplementation(() => {
      return {
        logger: {},
        run: jest.fn().mockImplementation(() => Promise.resolve())
      }
    })
    const mockedRunner = mock()
    const collection = new KunlunCollection(mockedRunner as AbstractRunner)
    try {
      await collection.execute('name', [])
    } catch (error) {
      expect(error.message).toEqual(
        'Invalid schematic "name". Please, ensure that "name" exists in this collection.'
      )
    }
  })
})
