import type { DMMF } from '@prisma/generator-helper'
import type { DBModel } from '../model'
import type { KLField } from './types'

export function parseKLConfModel(model: DMMF.Model, confModel: DBModel) {
  const { fields, ...rest } = model
  const { fields: confFields } = confModel
  const rFields: DMMF.Field[] = fields.map(field => {
    field.klConfig =
      confFields.filter(confField => confField.db.name === field.name)[0]?.db ||
      {}
    return field
  })
  return {
    fields: rFields,
    generatedApis: confModel.generatedApis,
    ...rest
  }
}

export function assignKLConfigField(field: KLField, name: string) {
  if (field.klConfig !== undefined) {
    field[name] = field.klConfig[name]
  }
}
