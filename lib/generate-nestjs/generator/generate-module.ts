import { kebab } from 'case'

import type { DtoParams } from './types'

interface GenerateModuleParam extends Pick<DtoParams, 'model'> {}

export const generateService = ({ model }: GenerateModuleParam) => {
  const name = model.name !== 'Model' ? model.name.slice(0, -5) : model.name
  const nameFirstLowercase =
    model.name.charAt(0).toLowerCase() + model.name.slice(1)
  const isRequiredUid = model.fields.some(
    i =>
      i.isRequired &&
      (i.type === 'UserModel' || i.type === 'AdminModel') &&
      (i.relationFromFields || []).includes('uid')
  )
  return `
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ${model.name} } from '@prisma/client'
import type { SchemaGeneratedModels, SchemaGeneratedModelMethods, Query${name}Dto, Create${name}Dto,
  Update${name}Dto } from '@/@generated'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from '@/common/prisma/prisma.service'
import { buildWhere, buildDataForCreateOrUpdate, getSelectFields, builderOrderBy } from '@/@generated/utils'

type ModelInstance<T extends SchemaGeneratedModels> =
  InstanceType<typeof PrismaService>[T]
type Model<M extends SchemaGeneratedModelMethods> = Parameters<
  ModelInstance<'${nameFirstLowercase}'>[M]
>[0]
type IdType = ${model.name}['id']

@Injectable()
export class ${name}Service implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {}

  async findById(
    where: Model<'findUnique'>['where']
  ) {
    return this.prisma.${nameFirstLowercase}.findUnique({
      where,
      select: getSelectFields('${name}Model', true)
    })
  }

  async findMany(query: Query${name}Dto) {
    const {
      _skip: skip,
      _take: take,
      _like = true,
      _sorter,
      ...rest
    } = query
    const where = buildWhere('${name}Model', rest, _like)
    const items = await this.prisma.${nameFirstLowercase}.findMany({
      where,
      skip,
      take,
      select: getSelectFields('${name}Model', rest),
      orderBy: builderOrderBy('${name}Model', _sorter)
    })
    const total = await this.prisma.${nameFirstLowercase}.count({
      where
    })
    return { total, items }
  }

  async create(payload: Create${name}Dto ${
    isRequiredUid ? `& { uid: ${model.name}['uid'] }` : ''
  }) {
    const data = buildDataForCreateOrUpdate('${name}Model',payload) as Model<'create'>['data']
    return this.prisma.${nameFirstLowercase}.create({ data })
  }

  async updateById(
    id: IdType,
    payload: Update${name}Dto
  ) {
    const data = buildDataForCreateOrUpdate('${name}Model', payload, false) as Model<'update'>['data']
    return this.prisma.${nameFirstLowercase}.update({
      where: { id },
      data
    })
  }

  async deleteById(id: IdType) {
    return this.prisma.${nameFirstLowercase}.delete({
      where: { id }
    })
  }
}
`
}

export const generateController = ({ model }: GenerateModuleParam) => {
  const name = model.name !== 'Model' ? model.name.slice(0, -5) : model.name
  const { documentation = '' } = model
  const service = name.charAt(0).toLowerCase() + name.slice(1) + 'Service'
  const comment = model.title || model.name
  const tag =
    comment !== '管理' && !comment.endsWith('管理') ? `${comment}管理` : comment
  const isRequiredUid = model.fields.some(
    i =>
      i.isRequired &&
      (i.type === 'UserModel' || i.type === 'AdminModel') &&
      (i.relationFromFields || []).includes('uid')
  )
  // const hasPrimitiveList = model.fields.filter(
  //   i =>
  //     i.isList &&
  //     ['String', 'Int', 'Float', 'Boolean'].includes(i.type as string)
  // )
  const hasListInterface = model.generatedApis?.includes('findMany')
  const hasDetailInterface = model.generatedApis?.includes('findByPrimaryKey')
  const hasAddInterface = model.generatedApis?.includes('create')
  const hasUpdateInterface = model.generatedApis?.includes('updateByPrimaryKey')
  const hasDeleteInterface = model.generatedApis?.includes('deleteByPrimarykey')
  return `
import { Body } from '@nestjs/common'
import type { ${name}Model } from '@prisma/client'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Connect${name}Dto, Create${name}Dto, Query${name}Dto, Update${name}Dto, KLMethod } from '@/@generated'
import { KLController, KLParam, KLQuery, KLUser } from '@/decorators'
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ${name}Service } from './${kebab(name)}.service'

@KLController('${tag}')
export class ${name}Controller {
  constructor(private readonly ${service}: ${name}Service) {}

  ${
    hasListInterface
      ? `
  @KLMethod('获取${comment}列表')
  async findMany(@KLQuery() query: Query${name}Dto) {
    return await this.${service}.findMany(query)
  }
  `
      : ''
  }

  ${
    hasDetailInterface
      ? `
  @KLMethod('获取${comment}详情')
  async findOne(@KLParam() params: Connect${name}Dto) {
    return await this.${service}.findById(params)
  }
  `
      : ''
  }

  ${
    hasAddInterface
      ? `
  @KLMethod('添加${comment}')
  async create(@KLUser('id') uid: string | number, @Body() body: Create${name}Dto) {
    return await this.${service}.create(${
          isRequiredUid ? '{ ...body, uid }' : 'body'
        })
  }
  `
      : ''
  }

  ${
    hasUpdateInterface
      ? `
  @KLMethod('更新${comment}')
  async update(@KLParam() params: Connect${name}Dto, @Body() body: Update${name}Dto) {
    return await this.${service}.updateById(params.id, body)
  }
  `
      : ''
  }

  ${
    hasDeleteInterface
      ? `
  @KLMethod('删除${comment}')
  async deleteById(@KLParam() params: Connect${name}Dto) {
    return await this.${service}.deleteById(params.id)
  }`
      : ''
  }

}
`
}

export const generateModule = ({ model }: GenerateModuleParam) => {
  const name = model.name !== 'Model' ? model.name.slice(0, -5) : model.name
  return `
import { Module } from '@nestjs/common'
import { ${name}Controller } from './${kebab(name)}.controller'
import { ${name}Service } from './${kebab(name)}.service'

@Module({
  controllers: [${name}Controller],
  providers: [${name}Service],
  exports: [${name}Service]
})
export class ${name}Module {}

`
}
