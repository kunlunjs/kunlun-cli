import path from 'path'
import type { DMMF } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import { kebab } from 'case'
import { omit } from 'lodash'
import { computeModelParams } from '../compute-model-params'
import {
  IGNOER_CREATE_INTERFACE,
  IGNOER_DELETE_INTERFACE,
  IGNOER_DETAIL_INTERFACE,
  IGNOER_LIST_INTERFACE,
  IGNOER_NESTJS_MODULE,
  IGNOER_UPDATE_INTERFACE,
  MODEL_IGNOER
} from './annotations'
import {
  isAnnotatedWith,
  isAnnotatedWithOneOf,
  isBoolean,
  isRequiredConfirm
} from './field-classifiers'
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
import {
  convertClassName,
  convertFileName,
  getComment,
  getLabels
} from './helpers'
import type { MakeHelpersParam } from './template-helpers'
import { makeHelpers } from './template-helpers'
import type { Model, WriteableFileSpecs } from './types'

const transformFileName = convertFileName
const transformClassName = convertClassName

export const defaultRemoveModelUnifiedSuffix = 'Model'

interface RunParam {
  removeModelUnifiedSuffix: MakeHelpersParam['removeModelUnifiedSuffix']
  output: string
  dmmf: DMMF.Document
  exportRelationModifierClasses: boolean
  outputToNestJSResourceStructure: boolean
  entityPrefix: string
  entitySuffix: string
  connectDtoPrefix: string
  createDtoPrefix: string
  updateDtoPrefix: string
  queryDtoPrefix: string
  dtoSuffix: string
  voPrefix: string
  voSuffix: string
  generateSchemaOfModule: string
}
export const run = ({
  dmmf,
  output, // 输出目录
  generateSchemaOfModule = '', // 哪些 schema 生成 module
  ...options
}: RunParam): WriteableFileSpecs[] => {
  const {
    removeModelUnifiedSuffix,
    exportRelationModifierClasses,
    outputToNestJSResourceStructure,
    ...preAndSuffixes
  } = options

  const templateHelpers = makeHelpers({
    removeModelUnifiedSuffix,
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
  const allEnums = dmmf.datamodel.enums
  const allModels = dmmf.datamodel.models

  const filteredModels: Model[] = allModels
    // 忽略被 @ignore 注释的 Model
    // .filter(model => !isAnnotatedWith(model, MODEL_IGNOER))
    // adds `output` information for each model so we can compute relative import paths
    // this assumes that NestJS resource modules (more specifically their folders on disk) are named as `transformFileName(model.name)`
    .map(model => {
      return {
        ...model,
        output: {
          entity: outputToNestJSResourceStructure
            ? path.join(
                output,
                transformFileName(model.name, removeModelUnifiedSuffix),
                'entities'
              )
            : output,
          connect: outputToNestJSResourceStructure
            ? path.join(
                output,
                transformFileName(model.name, removeModelUnifiedSuffix),
                'dto'
              )
            : `${output}/dto`, // `${output}/connect`,
          dto: outputToNestJSResourceStructure
            ? path.join(
                output,
                transformFileName(model.name, removeModelUnifiedSuffix),
                'dto'
              )
            : `${output}/dto`,
          vo: outputToNestJSResourceStructure
            ? path.join(
                output,
                transformFileName(model.name, removeModelUnifiedSuffix),
                'vo'
              )
            : `${output}/vo`,
          module: `${process.cwd()}/src/modules`
        }
      }
    })

  const modelFiles = filteredModels.map((model, ix) => {
    logger.info(`Processing Model ${model.name}`)
    const { name, documentation = '' } = model
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
    const createDto = isAnnotatedWith(model, IGNOER_CREATE_INTERFACE) && {
      fileName: path.join(
        model.output.dto,
        templateHelpers.createDtoFilename(name, true)
      ),
      content: generateCreateDto({
        ...modelParams.create,
        removeModelUnifiedSuffix,
        exportRelationModifierClasses,
        templateHelpers
      })
    }

    // generate update-{model}.dto.ts
    const updateDto = isAnnotatedWith(model, IGNOER_UPDATE_INTERFACE) && {
      fileName: path.join(
        model.output.dto,
        templateHelpers.updateDtoFilename(name, true)
      ),
      content: generateUpdateDto({
        ...modelParams.update,
        removeModelUnifiedSuffix,
        exportRelationModifierClasses,
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
        removeModelUnifiedSuffix,
        exportRelationModifierClasses,
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
    if (
      generateSchemaOfModule.split(',').includes(name) &&
      !isAnnotatedWithOneOf(model, [MODEL_IGNOER, IGNOER_NESTJS_MODULE])
    ) {
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
        const labels = getLabels(cur.documentation)
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
    const group = getComment(model.documentation) || model.name
    model.tag = group
    model.comment =
      group !== '管理' && !group.endsWith('管理') ? `${group}管理` : group
    model.interfaces = {}
    if (!isAnnotatedWith(model, IGNOER_LIST_INTERFACE)) {
      model.interfaces.list = `${model.comment}@获取${group}列表`
    }
    if (!isAnnotatedWith(model, IGNOER_DETAIL_INTERFACE)) {
      model.interfaces.detail = `${model.comment}@获取${group}详情`
    }
    if (!isAnnotatedWith(model, IGNOER_CREATE_INTERFACE)) {
      model.interfaces.add = `${model.comment}@添加${group}`
    }
    if (!isAnnotatedWith(model, IGNOER_UPDATE_INTERFACE)) {
      model.interfaces.update = `${model.comment}@更新${group}`
    }
    if (!isAnnotatedWith(model, IGNOER_DELETE_INTERFACE)) {
      model.interfaces.delete = `${model.comment}@删除${group}`
    }
    const fieldsName: string[] = []
    const fieldsByName = {}
    const inputUniqueFields: string[] = []
    const isNestedModel = false
    model.fields.forEach(field => {
      if (field.isUnique && !field.isId) {
        inputUniqueFields.push(field.name)
      }
      // TODO 用于前端展示（表格title、表单label）
      const title = model.name
      field.title = title || field.name
      if (field.kind === 'enum' && field.type) {
        // TODO 生成枚举类型 options: { label: string; value: string | boolean | number }[]
        field.options = allEnums
          .find(i => i.name === field.type)
          ?.values?.map(i => ({
            label: i.name,
            value: i.name
          }))
      }
      if (isBoolean(field)) {
        field.isBoolean = true
        field.options = [
          { label: '是', value: 'true' },
          { label: '否', value: 'false' }
        ]
      }
      if (isRequiredConfirm(field)) {
        field.isRequiredConfirm = true
      }
      // 标题 title
      // 是否在查询表单中隐藏
      // 是否在创建或更新表单中隐藏
      // 是否枚举
      // 是否布尔
      // 是否唯一
      // 是否JSON
      // 是否文件
      // 是否图标
      // 是否图像
      // 是否头像
      // 是否颜色
      // 是否只读
      // 是否整数
      // 是否密码
      // 是否日期时间
      // 是否创建时间
      // 是否更新时间
      // 是否删除时间
      // 是否浮点数
      // 是否富文本
      // 是否多行文本
      // 是否系统预置
      // 是否嵌套
      // 是否 parent
      // 是否 children
      // 是否动态列表：查询其它表的某个字段作为下拉选项
      // 是否关系字段
      // 是否关系字段主键
      // 是否需要二次确认 isRequiredConfirm
      // 是否指向某个外键的主键
      // 提示信息 tooltip
      // 在表格中显示宽度 width
      // 在指定项中 in
      // 是否系统内置 isSystemPreset
      // 是否默认查询不返回 select: false
      // 是否隐藏
      /* 指向自身 */

      // 对应多个关系的字段
      if (
        !field.isNested &&
        field.type !== model.name &&
        modelNames.includes(field.type as string)
      ) {
        const relationModel = filteredModels.find(
          i => i.name === field.type
        ) as DMMF.Model
        const tag = getComment(relationModel.documentation)
        field.serviceName = `${tag}管理@获取${tag}列表`
        const uniqueField = relationModel.fields.find(
          i => i.isUnique && !i.isId
        )
        if (uniqueField) {
          field.showFieldName = uniqueField.name
          field.showFieldTitle = uniqueField.title || uniqueField.name
        } else {
          const titleOrName = relationModel.fields.find(
            i => i.name === 'title' || i.name === 'name'
          )
          if (titleOrName) {
            field.showFieldName = titleOrName.name
            field.showFieldTitle = titleOrName.title || titleOrName.name
          }
        }
      }
      const hasPrimaryKeyOfParent = model.fields.find(i => {
        return (
          (i.relationFromFields || []).includes(field.name) &&
          i.type === model.name
        )
      })
      if (hasPrimaryKeyOfParent) {
        field.isNested = true
        field.asPrimaryKeyOfParent = hasPrimaryKeyOfParent.name
      }
      const hasWidthAnnotation = /@width=\d+/.test(field.documentation || '')
      if (hasWidthAnnotation) {
        field.width = Number(
          // @ts-ignore
          (field.documentation || '').match(/@width=(\d+)/)[1]
        )
      }
      if (!hasWidthAnnotation && field.isBoolean) {
        field.width = (field.title || field.name).length * 25
      }
      // TODO in
      if (/@tooltip=[^\n]+/.test(field.documentation || '')) {
        field.tooltip =
          // @ts-ignore
          (field.documentation.match(/@tooltip=([^\n]+)/) as string[])[1]
      }
      if (/@visibleIf=[\w]+:[\w]+/.test(field.documentation || '')) {
        const [n, v] = (
          field?.documentation?.match(/@visibleIf=([\w]+:[\w]+)/) as string[]
        )[1].split(':')
        field.visibleIf = { name: n, value: v }
      }

      fieldsName.push(field.name)
      // @ts-ignore
      fieldsByName[field.name] = field
    })
    if (
      !inputUniqueFields.length &&
      (model.documentation || '').match(/@uniqueField=([a-zA-Z]\w+)/)?.[1] &&
      model.fields.some(
        i =>
          i.name ===
          (model.documentation || '').match(/@uniqueField=([a-zA-Z]\w+)/)?.[1]
      )
    ) {
      inputUniqueFields.push(
        // @ts-ignore
        model.documentation.match(/@uniqueField=([a-zA-Z]\w+)/)[1]
      )
    }
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
        const comment = getComment(model.documentation) || model.name
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
          const comment = getComment(model.documentation) || model.name
          const tag =
            comment !== '管理' && !comment.endsWith('管理')
              ? comment
              : comment.slice(0, -2)
          return [
            !isAnnotatedWith(model, IGNOER_LIST_INTERFACE) && `获取${tag}列表`,
            !isAnnotatedWith(model, IGNOER_DETAIL_INTERFACE) &&
              `获取${tag}详情`,
            !isAnnotatedWith(model, IGNOER_CREATE_INTERFACE) && `添加${tag}`,
            !isAnnotatedWith(model, IGNOER_UPDATE_INTERFACE) && `更新${tag}`,
            !isAnnotatedWith(model, IGNOER_DELETE_INTERFACE) && `删除${tag}`
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
        name: 'now' | 'autoincrement'
        args: string[]
      }
  isId: boolean
  isList: boolean
  isUnique: boolean
  isRequired: boolean
  isNullable?: boolean
  isReadOnly?: boolean
  isUpdatedAt: boolean
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
  // [key: string]: any
}

export type InterfaceType = 'add' | 'update' | 'list' | 'detail' | 'delete'

export type SchemaModelByName = {
  name: SchemaModels
  dbName: string | null
  tag: string
  fieldsName: string[]
  comment: SchemaGeneratedModelTags
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
    )
      .replace(/("updatedAt":\s*{[^}]+})/g, 'updatedAt')
      .replace(/("deletedAt":\s*{[^}]+})/g, 'deletedAt')}
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
  key: 'add' | 'update' | 'list' | 'detail' | 'delete'
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
        const comment = getComment(model.documentation) || model.name
        const tag =
          comment !== '管理' && !comment.endsWith('管理')
            ? `${comment}管理`
            : comment
        const connectDto = `${options.connectDtoPrefix}${name}${options.dtoSuffix}`
        const createDto = `${options.createDtoPrefix}${name}${options.dtoSuffix}`
        const updateDto = `${options.updateDtoPrefix}${name}${options.dtoSuffix}`
        const queryDto = `${options.queryDtoPrefix}${name}${options.dtoSuffix}`
        const vo = `${options.voPrefix}${name}${options.voSuffix}`
        acc = {
          ...acc,
          [`获取${comment}列表`]: {
            key: 'list',
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
        if (!isAnnotatedWith(model, IGNOER_DETAIL_INTERFACE)) {
          acc[`获取${comment}详情`] = {
            key: 'detail',
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
        if (!isAnnotatedWith(model, IGNOER_CREATE_INTERFACE)) {
          acc[`添加${comment}`] = {
            key: 'add',
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
        if (!isAnnotatedWith(model, IGNOER_UPDATE_INTERFACE)) {
          acc[`更新${comment}`] = {
            key: 'update',
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
        if (!isAnnotatedWith(model, IGNOER_DELETE_INTERFACE)) {
          acc[`删除${comment}`] = {
            key: 'delete',
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
