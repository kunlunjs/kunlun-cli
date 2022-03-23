import type { MakeHelpersParam, TemplateHelpers } from './template-helpers'
import type { CreateDtoParams } from './types'

interface GenerateCreateDtoParam extends CreateDtoParams {
  exportRelationModifierClasses: boolean
  templateHelpers: TemplateHelpers
  removeModelUnifiedSuffix: MakeHelpersParam['removeModelUnifiedSuffix']
}
export const generateCreateDto = ({
  model,
  fields,
  imports, // 导入结构，example: [ { from: '@prisma/client', destruct: [ 'Prisma' ] } ]
  extraClasses,
  apiExtraModels,
  removeModelUnifiedSuffix,
  exportRelationModifierClasses,
  templateHelpers: t
}: GenerateCreateDtoParam) => {
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
export class ${t.createDtoClassName(name)} {
  ${t.fieldsToDtoProps(fields, true)}
}
`
}
