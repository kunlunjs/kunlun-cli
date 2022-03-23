import type { DMMF } from '@prisma/generator-helper'
import { isId } from '../generator/field-classifiers'
import {
  mapDMMFToDMMFField,
  uniq,
  zipImportStatementParams
} from '../generator/helpers'
import type { TemplateHelpers } from '../generator/template-helpers'

import type {
  ConnectDtoParams,
  ImportStatementParams
} from '../generator/types'

interface ComputeConnectDtoParamsParam {
  model: DMMF.Model
  templateHelpers: TemplateHelpers
}
export const computeConnectDtoParams = ({
  model,
  templateHelpers
}: ComputeConnectDtoParamsParam): ConnectDtoParams => {
  const imports: ImportStatementParams[] = []
  const idFields = model.fields.filter(field => {
    if (isId(field) && !/@comment\s?.+/.test(field.documentation || '')) {
      field.documentation = field.documentation
        ? `${field.documentation}\n@comment ID`
        : '@comment ID'
    }
    return isId(field)
  })
  // TODO 暂不开放其它唯一值字段的详情查询
  const isUniqueFields = [] // model.fields.filter(field => isUnique(field))

  /**
   * @ApiProperty({
   *  type: 'array',
   *  items: {
   *    oneOf: [{ $ref: getSchemaPath(A) }, { $ref: getSchemaPath(B) }],
   *  },
   * })
   * connect?: (A | B)[];
   */
  const uniqueFields = uniq([...idFields, ...isUniqueFields])
  const overrides = {} // uniqueFields.length > 1 ? { isRequired: false } : {}
  const fields = uniqueFields.map(field => mapDMMFToDMMFField(field, overrides))

  imports.unshift({
    from: '@nestjs/swagger',
    destruct: [
      'ApiExtraModels',
      'ApiProperty',
      'ApiPropertyOptional',
      'ApiHideProperty'
    ]
  })
  return { model, fields, imports: zipImportStatementParams(imports) }
}
