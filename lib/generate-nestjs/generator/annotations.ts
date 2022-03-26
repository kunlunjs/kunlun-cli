export const DTO_ENTITY_HIDDEN = /@DtoEntityHidden/
export const DTO_CREATE_OPTIONAL = /@DtoCreateOptional/
export const DTO_UPDATE_OPTIONAL = /@DtoUpdateOptional/
export const DTO_RELATION_REQUIRED = /@DtoRelationRequired/
export const DTO_RELATION_CAN_CRAEATE_ON_CREATE =
  /@DtoRelationCanCreateOnCreate/
export const DTO_RELATION_CAN_CONNECT_ON_CREATE =
  /@DtoRelationCanConnectOnCreate/
export const DTO_RELATION_CAN_CRAEATE_ON_UPDATE =
  /@DtoRelationCanCreateOnUpdate/
export const DTO_RELATION_CAN_CONNECT_ON_UPDATE =
  /@DtoRelationCanConnectOnUpdate/
export const DTO_RELATION_MODIFIERS = [
  DTO_RELATION_CAN_CRAEATE_ON_CREATE,
  DTO_RELATION_CAN_CONNECT_ON_CREATE,
  DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
  DTO_RELATION_CAN_CONNECT_ON_UPDATE
]
export const DTO_RELATION_MODIFIERS_ON_CREATE = [
  DTO_RELATION_CAN_CRAEATE_ON_CREATE,
  DTO_RELATION_CAN_CONNECT_ON_CREATE
]
export const DTO_RELATION_MODIFIERS_ON_UPDATE = [
  DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
  DTO_RELATION_CAN_CONNECT_ON_UPDATE
]
// 忽略某个 Model
export const MODEL_IGNOER = /@ignore/i
// 忽略某个 Field
export const FIELD_IGNOER = /@ignore/i
// 只读
export const IS_READ_ONLY = /@isReadOnly/i
// 不返回此项
export const SELECT_FALSE = /@selectFalse/i
// field 注释，关联 SQL Comment
export const FIELD_COMMENT = /@comment/i
// 不生成 NestJS module
export const IGNOER_NESTJS_MODULE = /@NestJSModuleIgnore/i
// 不生成列表接口
export const IGNOER_LIST_INTERFACE = /@listInterfaceIgnore/i
// 不生成详情接口
export const IGNOER_DETAIL_INTERFACE = /@detailInterfaceIgnore/i
// 不生成新增接口
export const IGNOER_CREATE_INTERFACE = /@createInterfaceIgnore/i
// 不生成更新接口
export const IGNOER_UPDATE_INTERFACE = /@updateInterfaceIgnore/i
// 不生成删除接口
export const IGNOER_DELETE_INTERFACE = /@deleteInterfaceIgnore/i
// 创建时不需要携带 - 用于关系字段主键
export const CREATE_IGNORE = /@createIgnore/i
// 更新时不需要携带 - 用于关系字段主键
export const UPDATE_IGNORE = /@updateIgnore/i
// 查询允许关系字段
export const ALLOW_QUERY_RELATION_FIELD = /@allowQueryRelationField/i
// 允许创建关系字段
export const ALLOW_ADD_RELATION_FIELD = /@allowAddRelationField/i
// 允许更新创建关系字段
export const ALLOW_UPDATE_RELATION_FIELD = /@allowUpdateRelationField/i
