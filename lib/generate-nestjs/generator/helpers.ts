import path from 'path'
import * as allSwaggerExports from '@nestjs/swagger'
import type { DMMF } from '@prisma/generator-helper'
import { camel, pascal, kebab, header, snake, constant } from 'case'
import * as allTransformerExports from 'class-transformer'
import * as allValidatorExports from 'class-validator'
import slash from 'slash'
import {
  isAnnotatedWith,
  isId,
  isRelation,
  isUnique
} from './field-classifiers'
import { scalarToTS } from './template-helpers'

import type { TemplateHelpers } from './template-helpers'
import type { ImportStatementParams, Model, DMMFField } from './types'
import { defaultRemoveModelUnifiedSuffix } from './index'

const caseMap = { camel, pascal, kebab, header, snake, constant }

const isValidDecorator = (str: string) =>
  /^[A-Z]/.test(str) && !/^[A-Z_\d]+$/.test(str)
// 有效的 class-validator 装饰器
export const ValidatorDecorators =
  Object.keys(allValidatorExports).filter(isValidDecorator)
// 有效的 class-transformer 装饰器
export const TransformerDecorators = Object.keys(allTransformerExports).filter(
  isValidDecorator
)
// export const KLValidators = Object.keys(klValidators).filter(isValidDecorator)
// console.log('KLValidators: ', KLValidators)
// export const KLValidators = Object.keys(allTransformerExports).filter(
//   isValidDecorator
// )
export const ValidDecorators = ValidatorDecorators.concat(TransformerDecorators)
// 有效的 Swagger 装饰器
export const SwaggerDecorators = Object.keys(allSwaggerExports).filter(
  i => /^[A-Z]/.test(i) && !/^[A-Z_\d]+$/.test(i)
)

export const stringToBoolean = (input: string, defaultValue = false) => {
  if (input === 'true') {
    return true
  }
  if (input === 'false') {
    return false
  }
  return defaultValue
}

export const uniq = <T = any>(input: T[]): T[] => Array.from(new Set(input))
export const concatIntoArray = <T = any>(source: T[], target: T[]) =>
  source.forEach(item => target.push(item))

export const makeImportsFromPrismaClient = (
  fields: DMMFField[]
): ImportStatementParams | null => {
  const enumsToImport = uniq(
    fields.filter(({ kind }) => kind === 'enum').map(({ type }) => type)
  )
  const importPrisma = fields
    .filter(({ kind }) => kind === 'scalar')
    .some(({ type }) => scalarToTS(type).includes('Prisma'))

  if (!(enumsToImport.length || importPrisma)) {
    return null
  }

  return {
    from: '@prisma/client',
    destruct: importPrisma ? ['Prisma', ...enumsToImport] : enumsToImport
  }
}

export const mapDMMFToDMMFField = (
  field: DMMF.Field,
  overrides: Partial<DMMF.Field> = {}
): DMMFField =>
  ({
    ...field,
    ...overrides
  } as DMMFField)

export const getRelationScalars = (
  fields: DMMF.Field[]
): Record<string, string[]> => {
  const scalars = fields.flatMap(
    ({ relationFromFields = [] }) => relationFromFields
  )

  return scalars.reduce(
    (result, scalar) => ({
      ...result,
      [scalar]: fields
        .filter(({ relationFromFields = [] }) =>
          relationFromFields.includes(scalar)
        )
        .map(({ name }) => name)
    }),
    {} as Record<string, string[]>
  )
}

interface GetRelationConnectInputFieldsParam {
  field: DMMF.Field
  allModels: DMMF.Model[]
}
export const getRelationConnectInputFields = ({
  field,
  allModels
}: GetRelationConnectInputFieldsParam): Set<DMMF.Field> => {
  const { name, type, relationToFields = [] } = field

  if (!isRelation(field)) {
    throw new Error(
      `Can not resolve RelationConnectInputFields for field '${name}'. Not a relation field.`
    )
  }

  const relatedModel = allModels.find(
    ({ name: modelName }) => modelName === type
  )

  if (!relatedModel) {
    throw new Error(
      `Can not resolve RelationConnectInputFields for field '${name}'. Related model '${type}' unknown.`
    )
  }

  if (!relationToFields.length) {
    throw new Error(
      `Can not resolve RelationConnectInputFields for field '${name}'. Foreign keys are unknown.`
    )
  }

  const foreignKeyFields = relationToFields.map(relationToFieldName => {
    const relatedField = relatedModel.fields.find(
      relatedModelField => relatedModelField.name === relationToFieldName
    )

    if (!relatedField)
      throw new Error(
        `Can not find foreign key field '${relationToFieldName}' on model '${relatedModel.name}'`
      )

    return relatedField
  })

  const idFields = relatedModel.fields.filter(relatedModelField =>
    isId(relatedModelField)
  )

  const uniqueFields = relatedModel.fields.filter(relatedModelField =>
    isUnique(relatedModelField)
  )

  const foreignFields = new Set<DMMF.Field>([
    ...foreignKeyFields,
    ...idFields,
    ...uniqueFields
  ])

  return foreignFields
}

export const getRelativePath = (from: string, to: string) => {
  const result = slash(path.relative(from, to))
  return result || '.'
}

interface GenerateRelationInputParam {
  field: DMMF.Field
  model: Model
  allModels: Model[]
  templateHelpers: TemplateHelpers
  preAndSuffixClassName:
    | TemplateHelpers['createDtoClassName']
    | TemplateHelpers['updateDtoClassName']
  canCreateAnnotation: RegExp
  canConnectAnnotation: RegExp
}
export const generateRelationInput = ({
  field,
  model,
  allModels,
  templateHelpers: t,
  preAndSuffixClassName,
  canCreateAnnotation,
  canConnectAnnotation
}: GenerateRelationInputParam) => {
  const relationInputClassProps: Array<Pick<DMMFField, 'name' | 'type'>> = []

  const imports: ImportStatementParams[] = []
  const apiExtraModels: string[] = []
  const generatedClasses: string[] = []

  if (isAnnotatedWith(field, canCreateAnnotation)) {
    const preAndPostfixedName = t.createDtoClassName(field.type as string)
    apiExtraModels.push(preAndPostfixedName)

    const modelToImportFrom = allModels.find(({ name }) => name === field.type)

    if (!modelToImportFrom)
      throw new Error(
        `related model '${field.type}' for '${model.name}.${field.name}' not found`
      )

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.createDtoFilename(field.type as string)}`
      ),
      destruct: [preAndPostfixedName]
    })

    relationInputClassProps.push({
      name: 'create',
      type: preAndPostfixedName
    })
  }

  if (isAnnotatedWith(field, canConnectAnnotation)) {
    const preAndPostfixedName = t.connectDtoClassName(field.type as string)
    apiExtraModels.push(preAndPostfixedName)
    const modelToImportFrom = allModels.find(({ name }) => name === field.type)

    if (!modelToImportFrom)
      throw new Error(
        `related model '${field.type}' for '${model.name}.${field.name}' not found`
      )

    imports.push({
      from: slash(
        `${getRelativePath(model.output.dto, modelToImportFrom.output.dto)}${
          path.sep
        }${t.connectDtoFilename(field.type as string)}`
      ),
      destruct: [preAndPostfixedName]
    })

    relationInputClassProps.push({
      name: 'connect',
      type: preAndPostfixedName
    })
  }

  if (!relationInputClassProps.length) {
    throw new Error(
      `Can not find relation input props for '${model.name}.${field.name}'`
    )
  }

  const originalInputClassName = `${t.transformClassName(
    model.name
  )}${t.transformClassName(field.name)}RelationInput`

  const preAndPostfixedInputClassName = preAndSuffixClassName(
    originalInputClassName
  )
  generatedClasses.push(`class ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(
      relationInputClassProps.map(inputField => ({
        ...inputField,
        kind: 'relation-input',
        isRequired: relationInputClassProps.length === 1,
        isList: field.isList
      })),
      true
    )}
  }`)

  apiExtraModels.push(preAndPostfixedInputClassName)

  return {
    type: preAndPostfixedInputClassName,
    imports,
    generatedClasses,
    apiExtraModels
  }
}

export const mergeImportStatements = (
  first: ImportStatementParams,
  second: ImportStatementParams
): ImportStatementParams => {
  if (first.from !== second.from) {
    throw new Error(
      `Can not merge import statements; 'from' parameter is different`
    )
  }

  if (first.default && second.default) {
    throw new Error(
      `Can not merge import statements; both statements have set the 'default' preoperty`
    )
  }

  const firstDestruct = first.destruct || []
  const secondDestruct = second.destruct || []
  const destructStrings = uniq(
    [...firstDestruct, ...secondDestruct].filter(
      destructItem => typeof destructItem === 'string'
    )
  )

  const destructObject = [...firstDestruct, ...secondDestruct].reduce(
    (result: Record<string, string>, destructItem) => {
      if (typeof destructItem === 'string') return result

      return { ...result, ...destructItem }
    },
    {} as Record<string, string>
  )

  return {
    ...first,
    ...second,
    destruct: [...destructStrings, destructObject]
  }
}

export const zipImportStatementParams = (
  items: ImportStatementParams[]
): ImportStatementParams[] => {
  const itemsByFrom = items.reduce((result, item) => {
    const { from } = item
    const { [from]: existingItem } = result
    if (!existingItem) {
      return { ...result, [from]: item }
    }
    return { ...result, [from]: mergeImportStatements(existingItem, item) }
  }, {} as Record<ImportStatementParams['from'], ImportStatementParams>)

  return Object.values(itemsByFrom)
}
/**
 * 转换 Model Name
 * modelUnifiedSuffix: 移除 Model 尾部多余的统一后缀
 * fileName 默认使用 camel: FooBar -> fooBar
 * className 默认使用 pascal: fooBar -> FooBar
 */
export const convertName = (
  name: string,
  transform: 'camel' | 'pascal' | 'kebab' | 'header' | 'snake' | 'constant',
  modelUnifiedSuffix = defaultRemoveModelUnifiedSuffix
): string => {
  const convert = caseMap[transform]
  return modelUnifiedSuffix &&
    name.endsWith(modelUnifiedSuffix) &&
    name !== modelUnifiedSuffix
    ? convert(name.slice(0, -`${modelUnifiedSuffix.length}`))
    : convert(name)
}
export const convertClassName = (
  name: string,
  modelUnifiedSuffix = defaultRemoveModelUnifiedSuffix
): string => {
  return convertName(name, 'pascal', modelUnifiedSuffix)
}
export const convertFileName = (
  name: string,
  modelUnifiedSuffix = defaultRemoveModelUnifiedSuffix
): string => {
  // return convertName(name, 'camel', modelUnifiedSuffix)
  return convertName(name, 'kebab', modelUnifiedSuffix)
}

/**
 * 从 documentation 摘取出注释
 * @param {string} /// @labels 系统 用户
 * @returns ['系统', '用户']
 */
export const getLabels = (items: any[]): string[] => {
  return items.map(x => x.value)
}

/**
 * 从 documentation 摘取出注释
 */
export const getTitle = (documentation = ''): string => {
  const docs = documentation.split('\n') as string[]
  const hasTitle = /@title\s*([^@]*)/
  const hasComment = /@comment\s*([^@]*)/
  const isTitle = docs.find(i => hasTitle.test(i) || hasComment.test(i)) || ''
  const title = (isTitle?.match(hasTitle) ||
    isTitle?.match(hasComment) || ['', ''])[1].trim()
  return title
}

export const getValidators = (documentation = ''): string => {
  // '@Length()  @IsEmail()' => ['@Length()', '@IsEmail()']
  const validators: string[] = []
  // 过滤出包含校验的行
  documentation.split('\n').forEach(i => {
    const v = i && i.trim()
    // TODO
    // 取出类似 @IsSomeValidator(...) 结构
    const decorator = v.match(/^@[A-Z][a-zA-Z]+\(.*\)$/)
    // 取出函数名
    const validator =
      decorator && (v.match(/^@([A-Z][a-zA-Z]+)\(.*/) as string[])[1]
    if (
      validator &&
      (ValidatorDecorators.includes(validator) ||
        TransformerDecorators.includes(validator))
    ) {
      validators.push(decorator[0])
    }
  })
  return validators.length ? validators.join('\n') : ''
}
