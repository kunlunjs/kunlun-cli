import type { TemplateHelpers } from './template-helpers'
import type { VoParams } from './types'

interface GenerateVoParam extends VoParams {
  templateHelpers: TemplateHelpers
}
export const generateVo = ({
  model,
  fields,
  imports,
  apiExtraModels,
  templateHelpers: t
}: GenerateVoParam) => {
  return `
${t.importStatements(imports)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
export class ${t.voClassName(model.name)} {
  ${t.fieldsToVoProps(fields, true)}
}
`
}
