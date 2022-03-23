import type { MakeHelpersParam, TemplateHelpers } from './template-helpers'
import type { QueryDtoParams } from './types'

interface GenerateQueryDtoParam extends QueryDtoParams {
  exportRelationModifierClasses: boolean
  templateHelpers: TemplateHelpers
  removeModelUnifiedSuffix: MakeHelpersParam['removeModelUnifiedSuffix']
}
export const generateQueryDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  removeModelUnifiedSuffix,
  exportRelationModifierClasses,
  templateHelpers: t
}: GenerateQueryDtoParam) => {
  const name =
    model.name !== removeModelUnifiedSuffix
      ? model.name.replace(new RegExp(`${removeModelUnifiedSuffix}$`), '')
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
