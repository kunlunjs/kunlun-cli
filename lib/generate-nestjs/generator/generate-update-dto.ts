import {
  exportRelationModifierClasses,
  modelUnifiedSuffix
} from './default-configs'
import type { TemplateHelpers } from './template-helpers'
import type { UpdateDtoParams } from './types'

interface GenerateUpdateDtoParam extends UpdateDtoParams {
  templateHelpers: TemplateHelpers
}
export const generateUpdateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  templateHelpers: t
}: GenerateUpdateDtoParam) => {
  const name =
    model.name !== modelUnifiedSuffix
      ? model.name.replace(new RegExp(`${modelUnifiedSuffix}$`), '')
      : model.name
  return `
${t.importStatements(imports)}

${t.each(
  extraClasses,
  exportRelationModifierClasses ? content => `export ${content}` : t.echo,
  '\n'
)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.updateDtoClassName(name)} {
  ${t.fieldsToDtoProps(fields, true)}
}
`
}
