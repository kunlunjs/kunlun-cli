import type { TemplateHelpers } from './template-helpers'
import type { ConnectDtoParams } from './types'

interface GenerateConnectDtoParam extends ConnectDtoParams {
  templateHelpers: TemplateHelpers
}

/**
 * 单文件模板
 */
export const generateConnectDto = ({
  model,
  fields,
  imports,
  templateHelpers: t
}: GenerateConnectDtoParam) => {
  const template = `
  ${t.importStatements(imports)}

  export class ${t.connectDtoClassName(model.name)} {
    ${t.fieldsToConnectProps(fields, true)}
  }
  `

  return template
}
