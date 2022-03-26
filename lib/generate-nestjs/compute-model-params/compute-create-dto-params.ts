import type { DMMF } from '@prisma/generator-helper'
import {
  hasDefaultValue,
  isCreatedAt,
  isDateTimeField,
  isDeletedAt,
  isId,
  isRelation,
  isUpdatedAt
} from '../generator/field-classifiers'
import {
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
  CreateDtoParams,
  ImportStatementParams,
  DMMFField
} from '../generator/types'

interface ComputeCreateDtoParamsParam {
  model: Model
  allModels: Model[]
  templateHelpers: TemplateHelpers
}

/**
 * 处理 Model 中的 field （排除、覆盖等）
 */
export const computeCreateDtoParams = ({
  model,
  allModels,
  templateHelpers
}: ComputeCreateDtoParamsParam): CreateDtoParams => {
  const imports: ImportStatementParams[] = []
  const apiExtraModels: string[] = []
  const extraClasses: string[] = []

  const relationScalarFields = getRelationScalars(model.fields)
  /// example: ProfileModel ['userId']
  const relationScalarFieldNames = Object.keys(relationScalarFields)
  const isIntId = model.fields.some(i => i.name === 'id' && i.type === 'Int')
  const fields = model.fields.reduce((result, field) => {
    const { name } = field
    const overrides: Partial<DMMF.Field> & { comment?: string } = {}
    if (
      !relationScalarFieldNames.includes(name) &&
      !isRelation(field) &&
      (isId(field) ||
        // isReadOnly(field) ||
        isCreatedAt(field) ||
        isUpdatedAt(field) ||
        isDeletedAt(field))
    )
      return result
    // DataModel 里面的 categories tags admin 都是 isRelation 为 true 的
    if ((field.documentation || '').match(/@default=/)) {
      overrides.customDefault =
        // @ts-ignore
        field.documentation.match(/@default=([^\s]*)/)[1]
    }
    // 创建时携带关系字段（需通过注解特别指定）
    const hasPrimaryKeyOfParent = model.fields.find(i => {
      return (
        (i.relationFromFields || []).includes(field.name) &&
        i.type === model.name
      )
    })
    const isNested = field.type === model.name || hasPrimaryKeyOfParent
    if (
      isNested &&
      !/@isCreateOrUpdateFormHidden/.test(field.documentation || '')
    ) {
      overrides.addOrUpdateRelationFieldType = `${
        isIntId ? 'number' : 'string'
      }${field.isList ? '[]' : ''}`
      overrides.isRequired = false
      if (field.isList && isIntId) {
        overrides.documentation = `${overrides.documentation}\n@Validate(IsIntegerArray,{message:'值应为整数数组'})`
      } else if (!field.isList && isIntId) {
        overrides.documentation = `${overrides.documentation}\n@IsInt()`
      }
    } else if (
      isNested &&
      /@isCreateOrUpdateFormHidden/.test(field.documentation || '')
    ) {
      return result
    }
    if (
      !isNested &&
      (isRelation(field) || relationScalarFieldNames.includes(field.name))
    ) {
      const isIntRelation = model.fields.some(
        i => relationScalarFieldNames.includes(i.name) && i.type === 'Int'
      )
      overrides.addOrUpdateRelationFieldType = `${
        isIntRelation ? 'number' : 'string'
      }${field.isList ? '[]' : ''}`
      overrides.isRequired = false
      if (field.isList && isIntRelation) {
        overrides.documentation = `${overrides.documentation}\n@Validate(IsIntegerArray,{message:'值应为整数数组'})`
      } else if (!field.isList && isIntRelation) {
        overrides.documentation = `${overrides.documentation}\n@IsInt()`
      }
    }

    if (hasDefaultValue(field)) {
      overrides.isRequired = false
    }
    if (
      isDateTimeField(field) &&
      !/@Type\(\s*\(\s*\)\s*=>\s*Date\s*\)/.test(overrides.documentation || '')
    ) {
      overrides.documentation = `${
        overrides.documentation || field.documentation
      }\n@Type(() => Date)`
    }

    return [...result, mapDMMFToDMMFField(field, overrides)]
  }, [] as DMMFField[])

  // if (apiExtraModels.length || hasEnum) {
  //   const destruct = []
  //   if (apiExtraModels.length)
  //     destruct.push('ApiExtraModels', 'ApiProperty', 'ApiPropertyOptional')
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
      'IsRangeArray',
      'IsIntegerArray',
      'IsNotEmptyUrlArray',
      'IsValidConfigValue'
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
