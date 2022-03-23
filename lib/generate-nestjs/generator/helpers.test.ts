import type { DMMF } from '@prisma/generator-helper'
import { mapDMMFToDMMFField } from './helpers'
import type { DMMFField } from './types'

describe('map DMMF.Field to DMMFField', () => {
  const field: DMMF.Field = {
    name: 'a',
    kind: 'scalar',
    type: 'string',
    isRequired: false,
    isUnique: false,
    isUpdatedAt: false,
    isList: false,
    isId: false,
    isReadOnly: false,
    isGenerated: false,
    hasDefaultValue: false
  }

  const overrides = { name: 'b' }

  it('overrides "name" property', () => {
    const parsedField = mapDMMFToDMMFField(field, overrides)
    expect(parsedField.name).toBe(overrides.name)
  })

  test('preserves all other properties from "field"', () => {
    const parsedField = mapDMMFToDMMFField(field, overrides)
    Object.keys(field)
      .filter(key => key !== 'name')
      .forEach(key => {
        expect(parsedField[key as keyof DMMFField]).toBe(field[key])
      })
  })
})
