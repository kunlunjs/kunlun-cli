import type { DMMF } from '@prisma/generator-helper'
import { IS_READ_ONLY } from './annotations'

export const isAnnotatedWith = (
  instance: DMMF.Field | DMMF.Model,
  annotation: RegExp
): boolean => {
  const { documentation = '' } = instance
  return annotation.test(documentation)
}

export const isAnnotatedWithOneOf = (
  instance: DMMF.Field | DMMF.Model,
  annotations: RegExp[]
): boolean =>
  annotations.some(annotation => isAnnotatedWith(instance, annotation))

export const hasAnnotatedWithComment = (
  instance: DMMF.Field | DMMF.Model,
  annotation = /@comment\s*([^@]*)/
): string => {
  const { documentation = '' } = instance
  return (documentation.match(annotation) || ['', ''])[1].trim()
}
// Field properties
// isGenerated, !meaning unknown - assuming this means that the field itself is generated, not the value
// isId,
// isList,
// isReadOnly, !no idea how this is set
// isRequired, !seems to be `true` for 1-n relation
// isUnique, !is not set for `isId` fields
// isUpdatedAt, filled by prisma, should thus be readonly
// kind, scalar, object (relation), enum, unsupported
// name,
// type,
// dbNames, !meaning unknown
// hasDefaultValue,
// default: fieldDefault,
// documentation = '',
// relationName,
// relationFromFields,
// relationToFields,
// relationOnDelete,

export const isId = (field: DMMF.Field): boolean => {
  return field.isId
}

export const isRequired = (field: DMMF.Field): boolean => {
  return field.isRequired
}

export const isScalar = (field: DMMF.Field): boolean => {
  return field.kind === 'scalar'
}

export const hasDefaultValue = (field: DMMF.Field): boolean => {
  return field.hasDefaultValue
}

export const isUnique = (field: DMMF.Field): boolean => {
  return field.isUnique
}

export const isRelation = (field: DMMF.Field): boolean => {
  const { kind /*, relationName */ } = field
  // indicates a `relation` field
  return kind === 'object' /* && relationName */
}

export const isIdWithDefaultValue = (field: DMMF.Field): boolean =>
  isId(field) && hasDefaultValue(field)

/**
 * checks if a DMMF.Field either has `isReadOnly` property or is annotated with
 * `@DtoReadOnly` comment.
 *
 * **Note:** this also removes relation scalar fields as they are marked as `isReadOnly`
 *
 * @param {FieldClassifierParam} param
 * @returns {boolean}
 */
export const isBoolean = (field: DMMF.Field): boolean =>
  field.type === 'Boolean'
export const isReadOnly = (field: DMMF.Field): boolean =>
  field.isReadOnly || isAnnotatedWith(field, IS_READ_ONLY)
export const isCreatedAt = (field: DMMF.Field): boolean => {
  return field.name === 'createdAt' // field.hasDefaultValue && !!field.default && field.type === 'DateTime'
}
export const isUpdatedAt = (field: DMMF.Field): boolean => {
  return field.isUpdatedAt
}
export const isDeletedAt = (field: DMMF.Field): boolean => {
  return field.name === 'deletedAt' && field.type === 'DateTime'
}
export const isDateTimeField = (field: DMMF.Field): boolean => {
  return (
    field.type === 'DateTime' &&
    !['createdAt', 'updatedAt', 'deletedAt'].includes(field.name)
  )
}
export const isDateTime = (field: DMMF.Field): boolean => {
  return field.type === 'DateTime'
}
export const isFile = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isFile/i)
}
export const isIcon = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isIcon/i)
}
export const isImage = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isImage/i)
}
export const isAvatar = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isAvatar/i)
}
export const isColor = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isColor/i)
}
export const isTextArea = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isTextArea/i)
}
export const isRichText = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isRichText/i)
}
export const isSelectFalse = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isSelectFalse/i)
}
export const isSystemPreset = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isSystemPreset/i)
}
export const isQueryFormHidden = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isQueryFormHidden/i)
}
export const isCreateOrUpdateFormHidden = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isCreateOrUpdateFormHidden/i)
}
export const isRequiredConfirm = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isRequiredConfirm/i)
}
export const isPassword = (field: DMMF.Field): boolean => {
  return isAnnotatedWith(field, /@isPassword/i)
}
/**
 * for schema-required fields that fallback to a default value when empty.
 *
 * Think: `createdAt` timestamps
 *
 * @example
 * ```prisma
 *  model Post {
 *    createdAt   DateTime @default(now())
 *  }
 *  ```
 */
export const isRequiredWithDefaultValue = (field: DMMF.Field): boolean =>
  isRequired(field) && hasDefaultValue(field)
