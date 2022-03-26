import path from 'path'
import type { DMMF } from '@prisma/generator-helper'
import slash from 'slash'
import { DTO_RELATION_REQUIRED } from '../generator/annotations'
import {
  isAnnotatedWith,
  isRelation,
  isRequired
} from '../generator/field-classifiers'
import {
  getRelationScalars,
  getRelativePath,
  makeImportsFromPrismaClient,
  mapDMMFToDMMFField,
  SwaggerDecorators,
  zipImportStatementParams
} from '../generator/helpers'

import type { TemplateHelpers } from '../generator/template-helpers'
import type {
  Model,
  EntityParams,
  ImportStatementParams,
  DMMFField
} from '../generator/types'

interface ComputeEntityParamsParam {
  model: Model
  allModels: Model[]
  templateHelpers: TemplateHelpers
}
export const computeEntityParams = ({
  model,
  allModels,
  templateHelpers
}: ComputeEntityParamsParam): EntityParams => {
  const imports: ImportStatementParams[] = []
  const apiExtraModels: string[] = []

  const relationScalarFields = getRelationScalars(model.fields)
  const relationScalarFieldNames = Object.keys(relationScalarFields)

  const fields = model.fields.reduce((result, field) => {
    const { name } = field
    const overrides: Partial<DMMF.Field> = {
      isRequired: true,
      isNullable: !field.isRequired
    }

    // relation fields are never required in an entity.
    // they can however be `selected` and thus might optionally be present in the
    // response from PrismaClient
    if (isRelation(field)) {
      overrides.isRequired = false
      overrides.isNullable = field.isList
        ? false
        : field.isRequired
        ? false
        : !isAnnotatedWith(field, DTO_RELATION_REQUIRED)

      // don't try to import the class we're preparing params for
      if (field.type !== model.name) {
        const modelToImportFrom = allModels.find(
          ({ name }) => name === field.type
        )

        if (!modelToImportFrom)
          throw new Error(
            `related model '${field.type}' for '${model.name}.${field.name}' not found`
          )

        const importName = templateHelpers.entityClassName(field.type as string)
        const importFrom = slash(
          `${getRelativePath(
            model.output.entity,
            modelToImportFrom.output.entity
          )}${path.sep}${templateHelpers.entityFilename(field.type as string)}`
        )

        // don't double-import the same thing
        // TODO should check for match on any import name ( - no matter where from)
        if (
          !imports.some(
            item =>
              Array.isArray(item.destruct) &&
              item.destruct.includes(importName) &&
              item.from === importFrom
          )
        ) {
          imports.push({
            destruct: [importName],
            from: importFrom
          })
        }
      }
    }

    if (relationScalarFieldNames.includes(name)) {
      const { [name]: relationNames } = relationScalarFields
      const isAnyRelationRequired = relationNames.some(relationFieldName => {
        const relationField = model.fields.find(
          anyField => anyField.name === relationFieldName
        )
        if (!relationField) return false

        return (
          isRequired(relationField) ||
          isAnnotatedWith(relationField, DTO_RELATION_REQUIRED)
        )
      })

      overrides.isRequired = true
      overrides.isNullable = !isAnyRelationRequired
    }

    return [...result, mapDMMFToDMMFField(field, overrides)]
  }, [] as DMMFField[])

  // if (apiExtraModels.length)
  //   imports.unshift({ from: '@nestjs/swagger', destruct: ['ApiExtraModels'] })
  imports.unshift({
    from: '@nestjs/swagger',
    destruct: SwaggerDecorators
  })

  const importPrismaClient = makeImportsFromPrismaClient(fields)
  if (importPrismaClient) imports.unshift(importPrismaClient)

  return {
    model,
    fields,
    apiExtraModels,
    imports: zipImportStatementParams(imports)
  }
}
