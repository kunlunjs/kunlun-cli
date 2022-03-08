export const schemaModels = [<% it.models.forEach(function(model, index) { %>'<%= model.name %>',<% }) %>] as const

export type SchemaModels = typeof schemaModels[number]

export const enumNames = [<% it.enums.forEach(function(_enum, index) { %>'<%= _enum.name %>',<% }) %>] as const

export type EnumNames = typeof enumNames[number]
