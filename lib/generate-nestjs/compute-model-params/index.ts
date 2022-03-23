import type { TemplateHelpers } from '../generator/template-helpers'
import type { Model, ModelParams } from '../generator/types'
import { computeConnectDtoParams } from './compute-connect-dto-params'
import { computeCreateDtoParams } from './compute-create-dto-params'
import { computeEntityParams } from './compute-entity-params'
import { computeModuleParams } from './compute-module-params'
import { computeQueryDtoParams } from './compute-query-dto-params'
import { computeUpdateDtoParams } from './compute-update-dto-params'
import { computeVoParams } from './compute-vo-params'

interface ComputeModelParamsParam {
  model: Model
  allModels: Model[]
  templateHelpers: TemplateHelpers
}

export const computeModelParams = ({
  model,
  allModels,
  templateHelpers
}: ComputeModelParamsParam): ModelParams => {
  return {
    entity: computeEntityParams({ model, allModels, templateHelpers }),
    connect: computeConnectDtoParams({ model, templateHelpers }),
    create: computeCreateDtoParams({
      model,
      allModels,
      templateHelpers
    }),
    update: computeUpdateDtoParams({
      model,
      allModels,
      templateHelpers
    }),
    query: computeQueryDtoParams({
      model,
      allModels,
      templateHelpers
    }),
    vo: computeVoParams({
      model,
      allModels,
      templateHelpers
    }),
    module: computeModuleParams({ model })
  }
}

/**
model
{
  name: 'DictionaryModel',
  isNested: false,
  dbName: 'dictionary',
  fields: [
    {
      name: 'id',
      kind: 'scalar',
      isList: false,
      isRequired: true,
      isUnique: false,
      isId: true,
      isReadOnly: false,
      type: 'Int',
      hasDefaultValue: true,
      default: [Object],
      isGenerated: false,
      isUpdatedAt: false
    },
    ...
  ],
  isGenerated: false,
  primaryKey: null,
  uniqueFields: [],
  uniqueIndexes: [],
  output: {
    dto: '/Users/turing/Desktop/Code/Github/prisma-generator-nestjs-dto/src/@generated',
    entity: '/Users/turing/Desktop/Code/Github/prisma-generator-nestjs-dto/src/@generated'
  }
}
templateHelpers
prisma:info Processing Model ArticleModel
{
  config: {
    connectDtoPrefix: 'Connect',
    createDtoPrefix: 'Create',
    updateDtoPrefix: 'Update',
    dtoSuffix: 'Dto',
    entityPrefix: '',
    entitySuffix: ''
  },
  apiExtraModels: [Function: apiExtraModels],
  entityClassName: [Function: entityClassName],
  entityFilename: [Function: entityFilename],
  connectDtoClassName: [Function: connectDtoName],
  createDtoClassName: [Function: createDtoClassName],
  updateDtoClassName: [Function: updateDtoClassName],
  voClassName: [Function: voClassName],
  voFileName: [Function: voFileName],
  updateDtoClassName: [Function: updateDtoClassName],
  connectDtoFilename: [Function: connectDtoFilename],
  createDtoFilename: [Function: createDtoFilename],
  updateDtoFilename: [Function: updateDtoFilename],
  each: [Function: each],
  echo: [Function: echo],
  fieldsToDtoProps: [Function: fieldsToDtoProps],
  fieldToDtoProp: [Function: fieldToDtoProp],
  fieldToEntityProp: [Function: fieldToEntityProp],
  fieldsToEntityProps: [Function: fieldsToEntityProps],
  fieldType: [Function: fieldType],
  for: [Function: each],
  if: [Function: when],
  importStatement: [Function: importStatement],
  importStatements: [Function: importStatements],
  transformFileName: [Function: camel],
  transformClassName: [Function: pascal],
  unless: [Function: unless],
  when: [Function: when]
}
 */
