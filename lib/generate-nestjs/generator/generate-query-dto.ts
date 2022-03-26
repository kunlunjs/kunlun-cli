import {
  exportRelationModifierClasses,
  modelUnifiedSuffix
} from './default-configs'
import type { TemplateHelpers } from './template-helpers'
import type { QueryDtoParams } from './types'

interface GenerateQueryDtoParam extends QueryDtoParams {
  templateHelpers: TemplateHelpers
}
export const generateQueryDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  templateHelpers: t
}: GenerateQueryDtoParam) => {
  const name =
    model.name !== modelUnifiedSuffix
      ? model.name.replace(new RegExp(`${modelUnifiedSuffix}$`), '')
      : model.name
  return `
${t.importStatements(imports)}
import { QueryOptionsDto } from '@/common'

${t.each(
  extraClasses,
  exportRelationModifierClasses ? content => `export ${content}` : t.echo,
  '\n'
)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.queryDtoClassName(name)} extends QueryOptionsDto {
  ${t.fieldsToDtoProps(fields, true, true, true)}
}
`
}
