import type { DMMF } from '@prisma/generator-helper'
import type { KLField } from './types'

export const isAnnotatedWith = (
  instance: KLField | DMMF.Model,
  annotation: RegExp
): boolean => {
  const { documentation = '' } = instance
  return annotation.test(documentation)
}

export const isAnnotatedWithOneOf = (
  instance: KLField | DMMF.Model,
  annotations: RegExp[]
): boolean =>
  annotations.some(annotation => isAnnotatedWith(instance, annotation))

export const hasAnnotatedWithComment = (
  instance: KLField | DMMF.Model,
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

export const isId = (field: KLField): boolean => {
  return field.isId
}

export const isRequired = (field: KLField): boolean => {
  return field.isRequired
}

export const isScalar = (field: KLField): boolean => {
  return field.kind === 'scalar'
}

export const hasDefaultValue = (field: KLField): boolean => {
  return field.hasDefaultValue
}

export const isUnique = (field: KLField): boolean => {
  return field.isUnique
}

export const isRelation = (field: KLField): boolean => {
  const { kind /*, relationName */ } = field
  // indicates a `relation` field
  return kind === 'object' /* && relationName */
}

export const isIdWithDefaultValue = (field: KLField): boolean =>
  isId(field) && hasDefaultValue(field)

/**
 * checks if a KLField either has `isReadOnly` property or is annotated with
 * `@DtoReadOnly` comment.
 *
 * **Note:** this also removes relation scalar fields as they are marked as `isReadOnly`
 *
 * @param {FieldClassifierParam} param
 * @returns {boolean}
 */
export const isBoolean = (field: KLField): boolean => field.type === 'Boolean'
export const isReadOnly = (field: KLField): boolean =>
  field.isReadOnly || field.isReadOnly
export const isCreatedAt = (field: KLField): boolean => {
  return field.name === 'createdAt' // field.hasDefaultValue && !!field.default && field.type === 'DateTime'
}
export const isUpdatedAt = (field: KLField): boolean => {
  // @ts-ignore
  return field.isUpdatedAt
}
export const isDeletedAt = (field: KLField): boolean => {
  return field.name === 'deletedAt' && field.type === 'DateTime'
}
export const isDateTimeField = (field: KLField): boolean => {
  return (
    field.type === 'DateTime' &&
    !['createdAt', 'updatedAt', 'deletedAt'].includes(field.name)
  )
}
export const isDateTime = (field: KLField): boolean => {
  return field.type === 'DateTime'
}
export const isFile = (field: KLField): boolean => {
  return field.isFile
}
export const isIcon = (field: KLField): boolean => {
  return field.isIcon
}
export const isImage = (field: KLField): boolean => {
  return field.isImage
}
export const isAvatar = (field: KLField): boolean => {
  return field.isAvatar
}
export const isColor = (field: KLField): boolean => {
  return field.isColor
}
export const isTextArea = (field: KLField): boolean => {
  return field.isTextArea
}
export const isRichText = (field: KLField): boolean => {
  return field.isRichText
}
export const isSelectFalse = (field: KLField): boolean => {
  return field.isSelectFalse
}
export const isSystemPreset = (field: KLField): boolean => {
  return field.isSystemPreset
}
export const isQueryFormHidden = (field: KLField): boolean => {
  return field.isQueryFormHidden
}
export const isCreateOrUpdateFormHidden = (field: KLField): boolean => {
  return field.isCreateOrUpdateFormHidden
}
export const isRequiredConfirm = (field: KLField): boolean => {
  return field.isRequiredConfirm
}
export const isPassword = (field: KLField): boolean => {
  return field.isPassword
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
export const isRequiredWithDefaultValue = (field: KLField): boolean =>
  isRequired(field) && hasDefaultValue(field)
