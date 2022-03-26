import type { DMMF } from '@prisma/generator-helper'

export interface Model extends DMMF.Model {
  output: {
    entity: string
    connect: string
    dto: string
    vo: string
    module: string
  }
}

export interface DMMFField extends Omit<DMMF.Field, 'kind' | 'type'> {
  kind: DMMF.FieldKind | 'relation-input' | 'object'
  type: 'String' | 'Boolean' | 'Int' | 'Json' | 'Float' | 'DateTime' | string // 'CreateProductCategoryRelationInputDto'
  // name: string
  // isList: boolean
  // isRequired: boolean
  /**
   * used when rendering Entity templates - fields that are optional in Prisma Schema
   * are returned as `null` values (if not filled) when fetched from PrismaClient.
   * **must not be `true` when `isRequired` is `true`**
   */
  // isNullable?: boolean
  // dbNames?: string[] | null
  // isId?: boolean
  // isUnique?: boolean
  // isReadonly?: boolean
  // isGenerated?: boolean
  // isUpdatedAt?: boolean
  // documentation?: string // '@DtoRelationRequired\n@DtoRelationCanConnectOnCreate'
  // hasDefaultValue?: boolean
  // relationName: string // 'CategoryToProduct'
  // relationToFields: string[] // ['id']
  // relationFromFields: string[] // ['categoryId']
  // default?:
  //   | boolean
  //   | {
  //       name: 'dbgenerated' | 'now' | 'autoincrement' | 'cuid' | 'uuid'
  //       args: ('gen_random_uuid()' | '"<(10,4),11>"::circle')[]
  //     }
  // [key: string]: any
}

export interface ExtraModel {
  originalName: string
  preAndPostfixedName: string
  isLocal?: boolean
}

export interface ImportStatementParams {
  from: string
  /**
   * imports default export from `from`.
   * use `string` to just get the default export and `{'*': localName`} for all exports (e.g. `import * as localName from 'baz'`)
   */
  default?: string | { '*': string }
  /**
   * imports named exports from `from`.
   * use `string` to keep exported name and `{exportedName: localName}` for renaming (e.g. `import { foo as bar } from 'baz'`)
   *
   * @example `foo`
   * @example `{exportedName: localName}`
   */
  destruct?: (string | Record<string, string>)[]
}

export interface DtoParams {
  model: DMMF.Model
  fields: DMMFField[]
  // should include all Enums, ExtraModels, ConnectDTOs and CreateDTOs for related models
  imports: ImportStatementParams[]
}

export type ConnectDtoParams = DtoParams // Omit<DtoParams, 'imports'>

export interface CreateDtoParams extends DtoParams {
  extraClasses: string[]
  apiExtraModels: string[]
}

export interface UpdateDtoParams extends DtoParams {
  extraClasses: string[]
  apiExtraModels: string[]
}

export interface QueryDtoParams extends DtoParams {
  extraClasses: string[]
  apiExtraModels: string[]
}

export interface EntityParams extends DtoParams {
  apiExtraModels: string[]
}

export interface VoParams extends DtoParams {
  apiExtraModels: string[]
}

export interface ModuleParams extends Pick<DtoParams, 'model'> {}

export interface ModelParams {
  entity: EntityParams
  connect: ConnectDtoParams
  create: CreateDtoParams
  update: UpdateDtoParams
  query: QueryDtoParams
  vo: VoParams
  module: Pick<DtoParams, 'model'>
}

export type WriteableFileSpecs = {
  fileName: string
  content: string
}
