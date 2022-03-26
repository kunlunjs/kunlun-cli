import {
  connectDtoPrefix,
  createDtoPrefix,
  dtoSuffix,
  entityPrefix,
  entitySuffix,
  modelUnifiedSuffix,
  queryDtoPrefix,
  updateDtoPrefix,
  voPrefix,
  voSuffix
} from './default-configs'
import type { convertClassName, convertFileName } from './helpers'
import { getComment, getValidators } from './helpers'
import type { ImportStatementParams, DMMFField } from './types'

const PrismaScalarToTypeScript: Record<string, string> = {
  Int: 'number',
  Float: 'number',
  String: 'string',
  DateTime: 'Date',
  Boolean: 'boolean',
  // [Working with Bytes](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bytes)
  Bytes: 'Buffer',
  // [Working with BigInt](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bigint)
  BigInt: 'bigint',
  // [working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
  Json: 'Prisma.JsonValue',
  // [Working with Decimal](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-decimal)
  Decimal: 'Prisma.Decimal'
}

const knownPrismaScalarTypes = Object.keys(PrismaScalarToTypeScript)

export const scalarToTS = (scalar: string, useInputTypes = false): string => {
  if (!knownPrismaScalarTypes.includes(scalar)) {
    throw new Error(`Unrecognized scalar type: ${scalar}`)
  }

  // [Working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
  // supports different types for input / output. `Prisma.InputJsonValue` extends `Prisma.JsonValue` with `undefined`
  if (useInputTypes && scalar === 'Json') {
    return 'Prisma.InputJsonValue'
  }

  return PrismaScalarToTypeScript[scalar]
}

export const echo = (input: string) => input

export const when = (condition: any, thenTemplate: string, elseTemplate = '') =>
  condition ? thenTemplate : elseTemplate

export const unless = (
  condition: any,
  thenTemplate: string,
  elseTemplate = ''
) => (!condition ? thenTemplate : elseTemplate)

export const each = <T = any>(
  arr: Array<T>,
  fn: (item: T) => string,
  joinWith = ''
) => arr.map(fn).join(joinWith)

export const importStatement = (input: ImportStatementParams) => {
  const { from, destruct = [], default: defaultExport } = input
  const fragments = ['import']
  if (defaultExport) {
    if (typeof defaultExport === 'string') {
      fragments.push(defaultExport)
    } else {
      fragments.push(`* as ${defaultExport['*']}`)
    }
  }
  if (destruct.length) {
    if (defaultExport) {
      fragments.push(',')
    }
    fragments.push(
      `{${destruct.flatMap(item => {
        if (typeof item === 'string') return item
        return Object.entries(item).map(([key, value]) => `${key} as ${value}`)
      })}}`
    )
  }

  fragments.push(`from '${from}'`)

  return fragments.join(' ')
}
// 生成文件头一行行 import ...
export const importStatements = (items: ImportStatementParams[]) =>
  `${each(items, importStatement, '\n')}`

export interface MakeHelpersParam {
  transformFileName?: typeof convertFileName
  transformClassName?: typeof convertClassName
}

/**
 * 处理导入、类名、field 等
 */
export const makeHelpers = ({
  transformClassName = echo,
  transformFileName = echo
}: MakeHelpersParam) => {
  const className = (name: string, prefix = '', suffix = '') => {
    // QA => QA  QACateotry => QACategory
    if (name.match(/^[A-Z]+(Model)?$/)) {
      return `${prefix}${name.replace(/Model$/, '')}${suffix}`
    }
    return `${prefix}${transformClassName(name, modelUnifiedSuffix)}${suffix}`
  }

  const fileName = (
    name: string,
    prefix = '',
    suffix = '',
    withExtension = false
  ) => {
    // QACategory => qa-category
    // if (name.match(/^[A-Z]+[a-z]+$/)) {
    //   return `${prefix}${name}${suffix}${when(withExtension, '.ts')}`
    // }
    return `${prefix}${transformFileName(
      name,
      modelUnifiedSuffix
    )}${suffix}${when(withExtension, '.ts')}`
  }

  const entityClassName = (name: string) =>
    className(name, entityPrefix, entitySuffix)
  const connectDtoClassName = (name: string) =>
    className(name, connectDtoPrefix, dtoSuffix)
  const createDtoClassName = (name: string) =>
    className(name, createDtoPrefix, dtoSuffix)
  const updateDtoClassName = (name: string) =>
    className(name, updateDtoPrefix, dtoSuffix)
  const queryDtoClassName = (name: string) =>
    className(name, queryDtoPrefix, dtoSuffix)
  const voClassName = (name: string) => className(name, voPrefix, voSuffix)

  const entityFilename = (name: string, withExtension = false) =>
    fileName(name, undefined, '.entity', withExtension)
  const connectDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'connect-', '.dto', withExtension)
  const createDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'create-', '.dto', withExtension)
  const updateDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'update-', '.dto', withExtension)
  const queryDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'query-', '.dto', withExtension)
  const voFilename = (name: string, withExtension = false) =>
    fileName(name, undefined, '.vo', withExtension)

  const fieldType = (
    field: DMMFField, // DMMF.Field
    toInputType = false
  ) => {
    return `${
      field.kind === 'scalar'
        ? scalarToTS(field.type, toInputType)
        : field.kind === 'enum' || field.kind === 'relation-input'
        ? field.type
        : entityClassName(field.type)
    }${when(field.isList, '[]')}`
  }

  const fieldTypeForVo = (
    field: DMMFField, // DMMF.Field
    toInputType = false
  ) => {
    return `${
      field.kind === 'scalar'
        ? scalarToTS(field.type, toInputType)
        : field.kind === 'enum' || field.kind === 'relation-input'
        ? field.type
        : `Partial<${voClassName(field.type)}>`
    }${when(field.isList, '[]')}`
  }

  const fieldToEntityProp = (
    field: DMMFField,
    useInputTypes = false,
    forceOptional = false
  ) => {
    const {
      name,
      kind,
      type,
      isList,
      isRequired,
      isNullable,
      isId,
      isUnique,
      isUpdatedAt,
      isReadonly,
      isGenerated,
      hasDefaultValue,
      documentation = ''
    } = field
    const isEnum = kind === 'enum'
    // 必须且不是自动生成且不可为null且无默认值
    const isNotEmtpty =
      isRequired && !isGenerated && !isNullable && !hasDefaultValue
    const property = isNotEmtpty ? 'ApiProperty' : 'ApiPropertyOptional'
    const comment = getComment(documentation)
    const _enum = `{ enum: ${fieldType(
      field,
      useInputTypes
    )}, description: '${comment}' }`
    return `${when(
      true,
      `@${property}(${isEnum ? _enum : `{description: '${comment}'}`})\n`
    )}${name}${unless(isRequired, '?')}: ${fieldType(field)} ${when(
      isNullable,
      ' | null'
    )};`
  }
  const fieldsToEntityProps = (
    fields: DMMFField[],
    useInputTypes = false,
    forceOptional = false
  ) =>
    `${each(
      fields,
      field => fieldToEntityProp(field, useInputTypes, forceOptional),
      '\n\n'
    )}`

  const fieldToConnectProp = (
    field: DMMFField,
    useInputTypes = false,
    forceOptional = false
  ) => {
    const {
      name,
      kind,
      type,
      isList,
      isRequired,
      isNullable,
      isId,
      isUnique,
      isUpdatedAt,
      isReadonly,
      isGenerated,
      hasDefaultValue,
      documentation = ''
    } = field
    const isEnum = kind === 'enum'
    let isNotEmtpty =
      isRequired && !isGenerated && !isNullable && !hasDefaultValue
    if (isId) {
      isNotEmtpty = true
    }
    const property = isNotEmtpty ? 'ApiProperty' : 'ApiPropertyOptional'
    const comment = getComment(documentation)
    const _enum = `{ enum: ${fieldType(
      field,
      useInputTypes
    )}, description: '${comment}' }`
    return `${when(
      true,
      `@${property}(${isEnum ? _enum : `{description: '${comment}'}`})\n`
    )}${name}${unless(isRequired && !forceOptional, '?')}: ${fieldType(
      field,
      useInputTypes
    )};`
  }
  const fieldsToConnectProps = (
    fields: DMMFField[],
    useInputTypes = false,
    forceOptional = false
  ) => {
    return `${each(
      fields,
      field => fieldToConnectProp(field, useInputTypes, forceOptional),
      '\n\n'
    )}`
  }

  const fieldToDtoProp = (
    field: DMMFField,
    useInputTypes = false,
    forceOptional = false,
    isQuery = false
  ) => {
    const {
      name,
      kind,
      type,
      isList,
      isRequired,
      isNullable,
      isId,
      isUnique,
      isUpdatedAt,
      isReadonly,
      isGenerated,
      hasDefaultValue,
      documentation = '',
      addOrUpdateRelationFieldType,
      queryRelationFieldType
    } = field
    const isEnum = kind === 'enum'
    const comment = getComment(documentation)
    const _enum = `{ enum: ${fieldType(
      field,
      useInputTypes
    )}, description: '${comment}' }`
    let isNotEmtpty =
      isRequired && !isGenerated && !isNullable && !hasDefaultValue
    if (forceOptional) {
      isNotEmtpty = false
    }
    let property = isNotEmtpty ? 'ApiProperty' : 'ApiPropertyOptional'
    const isSingleScalar = !isList && kind === 'scalar'
    const isScalarList = isList && kind === 'scalar'
    let validators = isNotEmtpty ? [`@IsNotEmpty()`] : [`@IsOptional()`]
    // 基本类型数组且有自定义默认值，可以选填
    if (isScalarList /* && field.customDefault*/) {
      property = 'ApiPropertyOptional'
      validators[0] = '@IsOptional()'
    }
    if (isReadonly) {
      validators.length = 0
    }
    const vs = getValidators(documentation)
    if (vs) {
      validators.push(vs)
    }
    if (isList && isQuery) {
      validators = validators.filter(
        i => !i.match(/@IsArray/) && !i.match(/@Transform/)
      )
    }
    if (isSingleScalar && isQuery) {
      validators = validators.filter(
        i => i === '@IsNotEmpty()' || i === '@IsOptional()'
      )
    }
    if (isQuery && isEnum) {
      validators.push(
        `@IsValidEnumArray('${field.type}',{message: '不允许查询不存在的枚举值'})`
      )
    }
    if (!isQuery && isEnum) {
      validators.push(`@IsEnum(${fieldType(field, useInputTypes)})`)
    }
    let questionMark = unless(isRequired && !forceOptional, '?')
    if (isScalarList /* && field.customDefault*/) {
      questionMark = '?'
    }
    let propertyType =
      addOrUpdateRelationFieldType ||
      queryRelationFieldType ||
      fieldType(field, useInputTypes)
    if (field.isRelation) {
      propertyType = 'string'
    }
    return `${when(
      true,
      `@${property}(${isEnum ? _enum : `{description: '${comment}'}`})\n`
    )}${validators.join('\n')}${name}${questionMark}: ${propertyType}${
      field.customDefault ? `= ${field.customDefault}` : ''
    }`
  }
  const fieldsToDtoProps = (
    fields: DMMFField[],
    useInputTypes = false,
    forceOptional = false,
    isQuery = false
  ) => {
    return `${each(
      fields,
      field => fieldToDtoProp(field, useInputTypes, forceOptional, isQuery),
      '\n\n'
    )}`
  }

  const fieldToVoProp = (
    field: DMMFField,
    useInputTypes = false,
    forceOptional = false
  ) => {
    const {
      name,
      kind,
      type,
      isList,
      isRequired,
      isNullable,
      isId,
      isUnique,
      isUpdatedAt,
      isReadonly,
      isGenerated,
      hasDefaultValue,
      documentation = ''
    } = field
    const isEnum = kind === 'enum'
    // 必须且不是自动生成且不可为null且无默认值
    const isNotEmtpty =
      isRequired && !isGenerated && !isNullable && !hasDefaultValue
    const property = 'ApiProperty' // isNotEmtpty ? 'ApiProperty' : 'ApiPropertyOptional'
    const comment = getComment(documentation)
    const _enum = `{ enum: ${fieldTypeForVo(
      field,
      useInputTypes
    )}, description: '${comment}' }`
    return `${when(
      true,
      `@${property}(${isEnum ? _enum : `{description: '${comment}'}`})\n`
    )}${name}${unless(isRequired, '?')}: ${fieldTypeForVo(field)} ${when(
      isNullable,
      ' | null'
    )};`
  }
  const fieldsToVoProps = (
    fields: DMMFField[],
    useInputTypes = false,
    forceOptional = false
  ) =>
    `${each(
      fields,
      field => fieldToVoProp(field, useInputTypes, forceOptional),
      '\n\n'
    )}`

  const apiExtraModels = (names: string[]) =>
    `@ApiExtraModels(${names.map(entityClassName)})`

  return {
    config: {
      modelUnifiedSuffix
    },
    apiExtraModels,
    entityClassName,
    connectDtoClassName,
    createDtoClassName,
    updateDtoClassName,
    queryDtoClassName,
    entityFilename,
    connectDtoFilename,
    createDtoFilename,
    updateDtoFilename,
    queryDtoFilename,
    voClassName,
    voFilename,
    each,
    echo,
    fieldsToConnectProps,
    fieldToConnectProp,
    fieldsToDtoProps,
    fieldToDtoProp,
    fieldToEntityProp,
    fieldsToEntityProps,
    fieldToVoProp,
    fieldsToVoProps,
    fieldType,
    fieldTypeForVo,
    for: each,
    if: when,
    importStatement,
    importStatements,
    transformFileName,
    transformClassName,
    unless,
    when
  }
}

export type TemplateHelpers = ReturnType<typeof makeHelpers>
