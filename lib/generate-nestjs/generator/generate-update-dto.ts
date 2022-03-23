import type { MakeHelpersParam, TemplateHelpers } from './template-helpers'
import type { UpdateDtoParams } from './types'

interface GenerateUpdateDtoParam extends UpdateDtoParams {
  exportRelationModifierClasses: boolean
  templateHelpers: TemplateHelpers
  removeModelUnifiedSuffix: MakeHelpersParam['removeModelUnifiedSuffix']
}
export const generateUpdateDto = ({
  model,
  fields,
  imports,
  extraClasses,
  apiExtraModels,
  removeModelUnifiedSuffix,
  exportRelationModifierClasses,
  templateHelpers: t
}: GenerateUpdateDtoParam) => {
  const name =
    model.name !== removeModelUnifiedSuffix
      ? model.name.replace(new RegExp(`${removeModelUnifiedSuffix}$`), '')
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
