import type { DMMF } from '@prisma/generator-helper'

import {
  // isAnnotatedWithOneOf,
  isCreatedAt,
  isDeletedAt,
  isUpdatedAt
} from '../generator/field-classifiers'
import {
  // concatIntoArray,
  // generateRelationInput,
  getRelationScalars,
  makeImportsFromPrismaClient,
  mapDMMFToDMMFField,
  SwaggerDecorators,
  TransformerDecorators,
  ValidatorDecorators,
  zipImportStatementParams
} from '../generator/helpers'
import type { TemplateHelpers } from '../generator/template-helpers'

import type {
  Model,
  QueryDtoParams,
  ImportStatementParams,
  DMMFField
} from '../generator/types'

interface ComputeQueryDtoParamsParam {
  model: Model
  allModels: Model[]
  templateHelpers: TemplateHelpers
}
/**
 * 处理 Model 中的 field （排除、覆盖等）
 */
export const computeQueryDtoParams = ({
  model,
  allModels,
  templateHelpers
}: ComputeQueryDtoParamsParam): QueryDtoParams => {
  // let hasEnum = false
  const imports: ImportStatementParams[] = []
  const extraClasses: string[] = []
  const apiExtraModels: string[] = []

  /**
   * DataModel
   * relationScalarFields:  { uid: [ 'user' ] }
   * relationScalarFieldNames: [ 'uid' ]
   */
  const relationScalarFields = getRelationScalars(model.fields)
  const relationScalarFieldNames = Object.keys(relationScalarFields)

  const fields = model.fields.reduce((result, field) => {
    const { name } = field
    const overrides: Partial<DMMF.Field> = { isRequired: false }

    // TODO: 允许根据时间范围查询
    if (isDeletedAt(field) || isCreatedAt(field) || isUpdatedAt(field))
      return result

    // DataModel 里面的 categories tags admin 都是 isRelation 为 true 的
    if ((field.documentation || '').match(/@default=/)) {
      // TODO
      // @default=[]
      overrides.customDefault =
        field.documentation.match(/@default=([^\s]*)/)[1]
    }

    if (
      field.isList &&
      (field.type === 'String' ||
        field.type === 'Int' ||
        field.type === 'Float' ||
        field.type === 'Boolean')
    ) {
      overrides.isPrimitiveList = true
      overrides[`is${field.type}PrimitiveList`] = true
    }

    if (field.kind === 'object' && allModels.some(i => i.name === field.type)) {
      overrides.isRelation = true
      if (field.isList) {
        overrides.isRelationList = true
      } else {
        overrides.isRelationOne = true
      }
    }
    return [...result, mapDMMFToDMMFField(field, overrides)]
  }, [] as DMMFField[])

  // if (apiExtraModels.length || hasEnum) {
  //   const destruct = []
  //   if (apiExtraModels.length) destruct.push('ApiExtraModels')
  //   if (hasEnum) destruct.push('ApiProperty')
  //   imports.unshift({ from: '@nestjs/swagger', destruct })
  // }
  imports.unshift({
    from: '@nestjs/swagger',
    destruct: SwaggerDecorators
  })
  imports.push({
    from: 'class-validator',
    destruct: ValidatorDecorators
  })
  imports.push({
    from: 'class-transformer',
    destruct: TransformerDecorators
  })
  imports.push({
    from: '@/validators',
    destruct: [
      'IsUrlArray',
      'IsIntegerArray',
      'IsNotEmptyUrlArray',
      'IsValidEnumArray'
    ]
  })

  const importPrismaClient = makeImportsFromPrismaClient(fields)
  if (importPrismaClient) imports.unshift(importPrismaClient)

  return {
    model,
    fields,
    extraClasses,
    apiExtraModels,
    imports: zipImportStatementParams(imports)
  }
}
