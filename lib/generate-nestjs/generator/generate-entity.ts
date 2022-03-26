import type { TemplateHelpers } from './template-helpers'
import type { EntityParams } from './types'

interface GenerateEntityParam extends EntityParams {
  templateHelpers: TemplateHelpers
}
export const generateEntity = ({
  model,
  fields,
  imports,
  apiExtraModels,
  templateHelpers: t
}: GenerateEntityParam) => {
  return `
${t.importStatements(imports)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.entityClassName(model.name)} {
  ${t.fieldsToEntityProps(fields, true)}
}
`
}
