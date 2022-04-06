import path from 'path'
import type { DMMF } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import { kebab } from 'case'
import { omit } from 'lodash'
import { computeModelParams } from '../compute-model-params'
import type { DBModel } from '../model'
import {
  connectDtoPrefix,
  createDtoPrefix,
  dtoSuffix,
  queryDtoPrefix,
  updateDtoPrefix,
  voPrefix,
  voSuffix
} from './default-configs'
import { isBoolean } from './field-classifiers'
import { generateConnectDto } from './generate-connect-dto'
import { generateCreateDto } from './generate-create-dto'
import {
  generateController,
  generateModule,
  generateService
} from './generate-module'
import { generateQueryDto } from './generate-query-dto'
import { generateUpdateDto } from './generate-update-dto'
import { generateVo } from './generate-vo'
import { convertClassName, convertFileName, getLabels } from './helpers'
import { assignKLConfigField, parseKLConfModel } from './parse-kl-config'
import { makeHelpers } from './template-helpers'
import type { DMMFField, KLModel, WriteableFileSpecs } from './types'

const transformFileName = convertFileName
const transformClassName = convertClassName

export const defaultRemoveModelUnifiedSuffix = 'Model'

interface RunParam {
  output: string
  dmmf: DMMF.Document
  generateSchemaOfModule: string
  klConfigJson: {
    models: DBModel[]
    enums: DMMF.DatamodelEnum[]
  }
}

export const run = ({
  dmmf,
  output, // 输出目录
  generateSchemaOfModule = '', // 哪些 schema 生成 module
  klConfigJson,
  ...options
}: RunParam): WriteableFileSpecs[] => {
  const { ...preAndSuffixes } = options

  const templateHelpers = makeHelpers({
    transformFileName,
    transformClassName,
    ...preAndSuffixes
  })
  /* @generate/models type SchemaModelType */
  /**
    *[{
      name: 'EArticleType',
      values: [
        { name: 'ORIGINAL', dbName: null },
        { name: 'REPRINT', dbName: null }
      ],
      dbName: null,
      documentation: '@commment 原创 转载'
    }]
   */
  const klConfigModels = klConfigJson.models
  const allEnums = klConfigJson.enums
  const allModels = dmmf.datamodel.models
  const filteredModels: KLModel[] = allModels
    // 忽略被 @ignore 注释的 Model
    // .filter(model => !isAnnotatedWith(model, MODEL_IGNOER))
    // adds `output` information for each model so we can compute relative import paths
    // this assumes that NestJS resource modules (more specifically their folders on disk) are named as `transformFileName(model.name)`
    .map(model => {
      const klModel = parseKLConfModel(
        model,
        klConfigModels.filter(item => item.name === model.name)[0]
      )
      return {
        ...klModel,
        output: {
          entity: output,
          connect: `${output}/dto`, // `${output}/connect`,
          dto: `${output}/dto`,
          vo: `${output}/vo`,
          module: `${process.cwd()}/src/modules`
        }
      }
    })

  const modelFiles = filteredModels.map((model, ix) => {
    logger.info(`Processing Model ${model.name}`)
    const { name } = model
    const modelParams = computeModelParams({
      model,
      allModels: filteredModels,
      templateHelpers
    })
    // generate model.entity.ts
    // const entityFileName = path.join(
    //   model.output.entity,
    //   templateHelpers.entityFilename(name, true)
    // )
    // const entity = {
    //   fileName: entityFileName,
    //   content: generateEntity({
    //     ...modelParams.entity,
    //     templateHelpers
    //   })
    // }

    // generate connect-{model}.dto.ts
    const connectDto = {
      fileName: path.join(
        model.output.connect,
        templateHelpers.connectDtoFilename(name, true)
      ),
      content: generateConnectDto({
        ...modelParams.connect,
        templateHelpers
      })
    }

    // generate create-{model}.dto.ts
    const createDto = model.generatedApis?.includes('create') && {
      fileName: path.join(
        model.output.dto,
        templateHelpers.createDtoFilename(name, true)
      ),
      content: generateCreateDto({
        ...modelParams.create,
        templateHelpers
      })
    }

    // generate update-{model}.dto.ts
    const updateDto = model.generatedApis?.includes('updateByPrimaryKey') && {
      fileName: path.join(
        model.output.dto,
        templateHelpers.updateDtoFilename(name, true)
      ),
      content: generateUpdateDto({
        ...modelParams.update,
        templateHelpers
      })
    }

    // generate query-{model}.dto.ts
    const queryDto = {
      fileName: path.join(
        model.output.dto,
        templateHelpers.queryDtoFilename(name, true)
      ),
      content: generateQueryDto({
        ...modelParams.query,
        templateHelpers
      })
    }

    // generate {model}.vo.ts
    const voFileName = path.join(
      model.output.vo,
      templateHelpers.voFilename(name, true)
    )
    const vo = {
      fileName: voFileName,
      content: generateVo({
        ...modelParams.vo,
        templateHelpers
      })
    }

    // generate NestJS Module
    if (model.ignore !== true) {
      const df = transformFileName(name)
      const prefix = `${model.output.module}/${df}/${df}`
      const nestService = {
        fileName: `${prefix}.service.ts`,
        content: generateService({
          ...modelParams.module
        })
      }
      const nestController = {
        fileName: `${prefix}.controller.ts`,
        content: generateController({
          ...modelParams.module
        })
      }
      const nestModule = {
        fileName: `${prefix}.module.ts`,
        content: generateModule({
          ...modelParams.module
        })
      }

      return [
        connectDto,
        createDto,
        updateDto,
        queryDto,
        vo,
        nestService,
        nestController,
        nestModule
      ].filter(Boolean)
    }
    return [connectDto, createDto, updateDto, queryDto, vo].filter(Boolean)
  })

  const enumFiles = {
    fileName: path.join(output, 'enums.ts'),
    content: `
import type { EnumsByName } from './types'

export const enumsByName: EnumsByName = ${JSON.stringify(
      allEnums.reduce((result, cur) => {
        const labels = getLabels(cur.values)
        const keys = cur.values.map(i => i.name)
        const options: ({ label: string; value: string } | string)[] =
          labels.length === keys.length
            ? labels.map((i, ix) => ({
                label: i,
                value: keys[ix]
              }))
            : keys.map(i => ({ label: i, value: i }))
        // @ts-ignore
        result[cur.name] = {
          name: cur.name,
          labelsByValue: options.reduce((a, b) => {
            if (typeof b === 'object') {
              a[b.value] = b.label
            } else {
              a[b] = b
            }
            return a
          }, {} as any),
          options
        }
        return result
      }, {}),
      null,
      2
    )}
`
  }

  const models = {}
  const modelNames = allModels.map(i => i.name)
  filteredModels.forEach(model => {
    const group = model.title || model.name
    model.tag = group
    model.interfaces = {}
    if (model.generatedApis?.includes('create')) {
      model.interfaces.create = `${group}@添加${group}`
    }
    if (model.generatedApis?.includes('findMany')) {
      model.interfaces.findMany = `${group}@获取${group}列表`
    }
    if (model.generatedApis?.includes('findByPrimaryKey')) {
      model.interfaces.findByPrimaryKey = `${group}@获取${group}详情`
    }
    if (model.generatedApis?.includes('updateByPrimaryKey')) {
      model.interfaces.updateByPrimaryKey = `${group}@更新${group}`
    }
    if (model.generatedApis?.includes('deleteByPrimaryKey')) {
      model.interfaces.deleteByPrimaryKey = `${group}@删除${group}`
    }
    // 导入、导出接口
    const fieldsName: string[] = []
    const fieldsByName: Record<string, DMMFField[]> = {}
    // TODO
    // 是否嵌套 Model
    // eslint-disable-next-line prefer-const
    let isNestedModel = false
    // 此 model 中所有唯一性的 field
    const inputUniqueFields: string[] = []
    model.fields.forEach(field => {
      if (field.isUnique && !field.isId) {
        inputUniqueFields.push(field.name)
      }
      field.title = field.klConfig?.title || field.name
      if (field.kind === 'enum' && field.type) {
        field.options = allEnums
          .find(i => i.name === field.type)
          ?.values?.map(i => ({
            label: i.name,
            value: i.name
          }))
      }
      // 是否布尔 isBoolean
      if (isBoolean(field)) {
        field.isBoolean = true
        field.options = [
          { label: '是', value: 'true' },
          { label: '否', value: 'false' }
        ]
      }
      // 是否在查询表单中隐藏 isQueryIgnore
      // 是否在创建更新表单中隐藏 isEffectIgnore
      // 是否枚举 isEnum
      if (field.kind === 'enum') {
        field.isEnum = true
      }
      // 是否唯一 isUnique
      // 是否JSON isJson
      if (field.type === 'Json') {
        field.isJson = true
      }
      // 是否文件 isFile
      if (field.klConfig?.isFile === true) {
        field.isJson = true
      }
      // 是否图标 isIcon
      assignKLConfigField(field, 'isIcon')
      // 是否图像 isImage
      assignKLConfigField(field, 'isImage')
      // 是否头像 isAvatar
      assignKLConfigField(field, 'isAvatar')
      // 是否颜色 isColor
      assignKLConfigField(field, 'isColor')
      // 是否只读 isReadOnly
      assignKLConfigField(field, 'isReadOnly')
      // 是否整数 isInteger
      assignKLConfigField(field, 'isInteger')
      // 是否密码 isPassword
      assignKLConfigField(field, 'isPassword')
      // 是否日期时间 isDateTime
      assignKLConfigField(field, 'isDateTime')
      // 是否创建时间 isCreatedAt
      assignKLConfigField(field, 'isCreatedAt')
      // 是否更新时间 isUpdatedAt
      assignKLConfigField(field, 'isUpdatedAt')
      // 是否删除时间 isDeletedAt
      assignKLConfigField(field, 'isDeletedAt')
      // 是否浮点数 isFloat
      assignKLConfigField(field, 'isFloat')
      // 是否富文本 isRichText
      assignKLConfigField(field, 'isRichText')
      // 是否多行文本 isTextArea
      assignKLConfigField(field, 'isTextArea')
      // 是否系统预置 isSystemPreset
      assignKLConfigField(field, 'isSystemPreset')
      // 是否嵌套 isNested
      // 是否 parent
      // 是否 children
      // 是否动态列表：查询其它表的某个字段作为下拉选项，接口名
      // 是否关系字段 isRelationField
      // 是否关系字段主键 isRelationPrimary
      // 是否需要二次确认 isRequiredConfirm，比如删除确认
      // 是否指向关联表的主键
      // 提示信息 tooltip
      // 在表格中显示宽度 width
      // 在指定项中 in
      // 是否默认查询不返回 select: false
      assignKLConfigField(field, 'isSelectFalse')
      // 是否隐藏 isHidden
      assignKLConfigField(field, 'isHidden')
      // 前端选择下拉框显示其他表的某个字段（异步接口）
      fieldsName.push(field.name)
      // @ts-ignore
      fieldsByName[field.name] = field
    })
    // @ts-ignore
    models[model.name] = omit(
      {
        ...model,
        fieldsName,
        inputUniqueFields,
        fieldsByName,
        isNestedModel
      },
      ['output', 'fields']
    )
  })

  const typesFile = {
    fileName: path.join(output, 'types.ts'),
    content: `
export const schemaModels = ${JSON.stringify(
      filteredModels.map(i => i.name),
      null,
      2
    )} as const

export type SchemaModels = typeof schemaModels[number]

export const schemaGeneratedModelTags = ${JSON.stringify(
      filteredModels.map(model => {
        const comment = model.title || model.name
        const tag =
          comment !== '管理' && !comment.endsWith('管理')
            ? `${comment}管理`
            : comment
        return tag
      }),
      null,
      2
    )} as const

export type SchemaGeneratedModelTags = typeof schemaGeneratedModelTags[number]

export const schemaGeneratedModels = ${JSON.stringify(
      filteredModels.map(i => i.name.charAt(0).toLowerCase() + i.name.slice(1)),
      null,
      2
    )} as const

export type SchemaGeneratedModels = typeof schemaGeneratedModels[number]

export const interfaces = ${JSON.stringify(
      filteredModels
        .map(model => {
          const comment = model.title || model.name
          const tag =
            comment !== '管理' && !comment.endsWith('管理')
              ? comment
              : comment.slice(0, -2)
          return [
            model.generatedApis?.includes('findMany') && `获取${tag}列表`,
            model.generatedApis?.includes('findByPrimaryKey') &&
              `获取${tag}详情`,
            model.generatedApis?.includes('create') && `添加${tag}`,
            model.generatedApis?.includes('updateByPrimaryKey') && `更新${tag}`,
            model.generatedApis?.includes('deleteByPrimaryKey') && `删除${tag}`
          ].filter(Boolean)
        })
        .flat(),
      null,
      2
    )} as const

export type Interfaces = typeof interfaces[number]

export const schemaGeneratedModelMethods = [
  'findUnique',
  'findMany',
  'create',
  'update'
  // createMany
  // delete,
  // deleteMany,
  // 'updateMany'
] as const

export type SchemaGeneratedModelMethods =
  typeof schemaGeneratedModelMethods[number]

export type DMMFField = {
  name: string
  title?: string
  kind: 'scalar' | 'object' | 'enum' | 'unsupported' | 'relation-input' | string
  type: 'Int' | 'String' | 'Boolean' | 'Json' | 'Float' | 'DateTime' | string
  default?:
    | string
    | number
    | boolean
    | {
        name: 'dbgenerated' | 'now' | 'autoincrement' | 'cuid' | 'uuid'
        args: string[]
      }
  isId: boolean
  isList: boolean
  isUnique: boolean
  isRequired: boolean
  isNullable?: boolean
  isReadOnly?: boolean
  isUpdatedAt?: boolean
  isCreatedAt?: boolean
  isDeletedAt?: boolean
  isGenerated?: boolean
  relationName?: string
  documentation?: string
  hasDefaultValue?: boolean
  relationToFields?: string[]
  relationFromFields?: string[]
  options?: string[] | {label: string; value: string}[]
  isFile?: boolean
  isIcon?: boolean
  isJson?: boolean
  isEnum?: boolean
  isImage?: boolean
  isFloat?: boolean
  isColor?: boolean
  isHidden?: boolean
  isAvatar?: boolean
  isBoolean?: boolean
  isInteger?: boolean
  isRichText?: boolean
  isPassword?: boolean
  isDateTime?: boolean
  isTextArea?: boolean
  isSelectFalse?: boolean
  isSystemPreset?: boolean
  isPrimitiveList?: boolean
  isIntPrimitiveList?: boolean
  isFloatPrimitiveList?: boolean
  isStringPrimitiveList?: boolean
  isBooleanPrimitiveList?: boolean
  // 是否关系键
  isRelationField?: boolean
  // 作为哪个相邻关系的主键
  asPrimaryKeyOfForeignKey?: string
  // 指向关系键的主键
  relationToOtherModelPrimaryKey?: string
  // 作为哪个父关系的主键
  asPrimaryKeyOfParent?: string
  isNested?: boolean
  isParentField?: boolean
  isChildrenField?: boolean
  queryRelationFieldType?: string[] | string
  addOrUpdateRelationFieldType?: number[] | number
  serviceName?: string
  showFieldName?: string
  showFieldTitle?: string
  labelNames?: { label: string; value: string; children: string }
  isQueryFormHidden?: boolean
  isRequiredConfirm?: boolean
  isCreateOrUpdateFormHidden?: boolean
  width?: number
  tooltip?: string
  visibleIf?: {
    name: string
    value: string | number | boolean
  }
  [key: string]: any
}

export type InterfaceType = 'create' | 'updateByPrimaryKey' | 'findMany' | 'findByPrimaryKey' | 'deleteByPrimaryKey' | 'importFromExcel' | 'exportExcel'

export type SchemaModelByName = {
  name: SchemaModels
  dbName: string | null
  tag: string
  fieldsName: string[]
  // comment: SchemaGeneratedModelTags
  fieldsByName: Record<string, DMMFField>
  interfaces: { [K in InterfaceType]?: string }
  isGenerated: false
  isNested?: boolean
  documentation?: string
  primaryKey: string | null
  isNestedModel?: boolean
  inputUniqueFields: string[]
  uniqueFields: string[] | string[][]
  uniqueIndexes: string[] | {name: string | null; fields: string[]}[]
  generatedApis: string[]
}

export type ModelsByName = {
  [K in SchemaModels]?: SchemaModelByName
}

export const enumNames = ${JSON.stringify(
      allEnums.map(i => i.name),
      null,
      2
    )} as const

export type EnumNames = typeof enumNames[number]

export type EnumsByName = {
  [K in EnumNames]?: {
    name: EnumNames
    options: ({
      label: string
      value: string
    } | string)[]
    labelsByValue: Record<string, string>
  }
}
`
  }

  const tablesFile = {
    fileName: path.join(output, 'tables.ts'),
    content: `
export const schemaTables = ${JSON.stringify(
      filteredModels.map(i => i.dbName),
      null,
      2
    )} as const

export type SchemaTables = typeof schemaTables[number]
  `
  }

  const modelsFile = {
    fileName: path.join(output, 'models.ts'),
    content: `
import type { DMMFField } from './types'
import { SchemaModelByName, SchemaModels } from './types'

const createdAt: DMMFField = {
  name: 'createdAt',
  kind: 'scalar',
  isList: false,
  isRequired: true,
  isUnique: false,
  isId: false,
  isReadOnly: false,
  type: 'DateTime',
  hasDefaultValue: true,
  default: {
    name: 'now',
    args: []
  },
  isGenerated: false,
  isUpdatedAt: false,
  documentation: '@comment 创建时间',
  title: '创建时间',
  isDateTime: true,
  isCreatedAt: true
}
const updatedAt: DMMFField = {
  name: 'updatedAt',
  kind: 'scalar',
  isList: false,
  isRequired: true,
  isUnique: false,
  isId: false,
  isReadOnly: false,
  type: 'DateTime',
  hasDefaultValue: false,
  isGenerated: false,
  isUpdatedAt: true,
  documentation: '@comment 更新时间',
  title: '更新时间',
  isDateTime: true
}
const deletedAt: DMMFField = {
  name: 'deletedAt',
  kind: 'scalar',
  isList: false,
  isRequired: false,
  isUnique: false,
  isId: false,
  isReadOnly: false,
  type: 'DateTime',
  hasDefaultValue: false,
  isGenerated: false,
  isUpdatedAt: false,
  title: 'deletedAt',
  isDateTime: true,
  isDeletedAt: true
}

export const modelsByName: Record<SchemaModels, SchemaModelByName> = ${JSON.stringify(
      models,
      null,
      2
    )}
  `
  }

  const endpoints = {
    fileName: `${output}/endpoints.ts`,
    content: `
import type { Method } from 'axios'
import * as allDtos from './dto'
import type { SchemaModels, Interfaces } from './types'
import * as allVos from './vo'

export type AllDtos = keyof typeof allDtos
export type AllVos = keyof typeof allVos

export type Endpoints = Record<
  Interfaces,
  EndpointsItem
>

export class EndpointsItem {
  key: 'create' | 'updateByPrimaryKey' | 'findMany' | 'findByPrimaryKey' | 'deleteByPrimaryKey' | 'importFromExcel' | 'exportExcel'
  model: SchemaModels
  tag: string
  comment: string
  summary: Interfaces
  method: Method
  path: string
  dto: string
  vo: string | [string] | null
}

export const endpoints: Endpoints = ${JSON.stringify(
      filteredModels.reduce((acc, model) => {
        const name =
          model.name !== 'Model' ? model.name.slice(0, -5) : model.name
        const kname = kebab(name)
        const comment = model.title || model.name
        // TODO 分组名
        const tag = model.title || model.name
        const connectDto = `${connectDtoPrefix}${name}${dtoSuffix}`
        const createDto = `${createDtoPrefix}${name}${dtoSuffix}`
        const updateDto = `${updateDtoPrefix}${name}${dtoSuffix}`
        const queryDto = `${queryDtoPrefix}${name}${dtoSuffix}`
        const vo = `${voPrefix}${name}${voSuffix}`
        acc = {
          ...acc,
          [`获取${comment}列表`]: {
            key: 'findMany',
            model: model.name,
            tag: comment,
            comment: tag,
            // controller: `${name}Controller`,
            summary: `获取${comment}列表`,
            // function: 'findMany',
            method: 'GET',
            path: `/${kname}-list`,
            dto: queryDto,
            vo: [vo]
          }
        }
        if (model.generatedApis?.includes('findByPrimaryKey')) {
          acc[`获取${comment}详情`] = {
            key: 'findByPrimaryKey',
            model: model.name,
            tag: comment,
            comment: tag,
            // controller: `${name}Controller`,
            summary: `获取${comment}详情`,
            // function: 'findByPrimaryKey',
            method: 'GET',
            path: `/${kname}/:id`,
            dto: connectDto,
            vo: vo
          }
        }
        if (model.generatedApis?.includes('create')) {
          acc[`添加${comment}`] = {
            key: 'create',
            model: model.name,
            tag: comment,
            comment: tag,
            // controller: `${name}Controller`,
            summary: `添加${comment}`,
            // function: 'create',
            method: 'POST',
            path: `/${kname}`,
            dto: createDto,
            vo: vo
          }
        }
        if (model.generatedApis?.includes('updateByPrimaryKey')) {
          acc[`更新${comment}`] = {
            key: 'updateByPrimaryKey',
            model: model.name,
            tag: comment,
            comment: tag,
            // controller: `${name}Controller`,
            summary: `更新${comment}`,
            // function: 'updateByPrimaryKey',
            method: 'PUT',
            path: `/${kname}/:id`,
            dto: updateDto,
            vo: vo
          }
        }
        if (model.generatedApis?.includes('deleteByPrimaryKey')) {
          acc[`删除${comment}`] = {
            key: 'deleteByPrimaryKey',
            model: model.name,
            tag: comment,
            comment: tag,
            // controller: `${name}Controller`,
            summary: `删除${comment}`,
            // function: 'deleteByPrimaryKey',
            method: 'DELETE',
            path: `/${kname}/:id`,
            dto: connectDto,
            vo: null
          }
        }
        return acc
      }, {} as any),
      null,
      2
    )}
`
  }
  // @ts-ignore
  return [...modelFiles]
    .concat([endpoints, typesFile, tablesFile, modelsFile, enumFiles])
    .flat()
}
