import { modelUnifiedSuffix } from './default-configs'
import type { TemplateHelpers } from './template-helpers'
import type { CreateDtoParams } from './types'

interface GenerateCreateDtoParam extends CreateDtoParams {
  exportRelationModifierClasses: boolean
  templateHelpers: TemplateHelpers
}
export const generateCreateDto = ({
  model,
  fields,
  imports, // 导入结构，example: [ { from: '@prisma/client', destruct: [ 'Prisma' ] } ]
  extraClasses,
  apiExtraModels,
  exportRelationModifierClasses,
  templateHelpers: t
}: GenerateCreateDtoParam) => {
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
export class ${t.createDtoClassName(name)} {
  ${t.fieldsToDtoProps(fields, true)}
}
`
}
