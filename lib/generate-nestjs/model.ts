export type ModelGeneratePlugin = (
  action: {
    currentModel: DBModel
    action: 'create' | 'update' | 'remove'
  },
  models: DBModel[]
) => Promise<void> | void

export type DBConnectionConfig = {
  develop: string
}

export type DBModel = {
  id: string
  /**
   * 模型名
   */
  name: string
  /**
   * 描述
   */
  description?: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 版本
   */
  version?: string
  /**
   * 备份策略
   */
  backupStrategy?: 'none' | 'auto'
  /**
   * 备份时间
   */
  backupCrontab?: string
  /**
   * 是否可创建
   */
  canCreate?: boolean
  /**
   * 是否可更新
   */
  canUpdate?: boolean
  /**
   * 是否可删除
   */
  canDelete?: boolean
  /**
   * 自动生成的http接口列表
   */
  generatedApis?: ('list' | 'get' | 'create' | 'update' | 'delete')[]
  /**
   * 模型的字段
   */
  fields: DBModelField[]
  /**
   * 主键
   */
  primaryKey: string | string[]
  /**
   * 唯一性
   */
  unique?: string[]
  /**
   * 索引
   */
  index?: string[]
  /**
   * 忽略
   */
  ignore?: boolean
}

interface KLDBField {
  /**
   * 字段名
   */
  name: string
  /**
   * 字段标题
   */
  title: string
  /**
   * 描述
   */
  description?: string
  /**
   * 备注
   */
  remark?: string
  /**
   * 是否是主键
   */
  isPrimaryKey?: boolean
  /**
   * 主键策略
   */
  primaryKeyStrategy?: 'autoincrement' | 'cuid' | 'uuid'
  /**
   * 类型
   */
  type:
    | 'String'
    | 'Boolean'
    | 'Int'
    | 'BigInt'
    | 'Float'
    | 'Decimal'
    | 'DateTime'
    | 'Json'
    | 'Bytes'
  /**
   * 是否是数组
   */
  isArray?: boolean
  /**
   * 原始数据类型
   */
  primitiveType?: string
  /**
   * 是否唯一
   */
  unique?: boolean
  /**
   * 是否可 null
   */
  nullable?: boolean
  /**
   * 默认值
   */
  defaultValue?: string | number | boolean | null | object | Array<any>
  /**
   * 小数点
   */
  decimal?: number
  /**
   * 长度
   */
  length?: number
  // added
  isPassword: boolean
  isDateTime: boolean
  isCreatedAt: boolean
  isUpdatedAt: boolean
  isDeletedAt: boolean
  isFile: boolean
  isIcon: boolean
  isImage: boolean
  isAvatar: boolean
  isColor: boolean
  isTextArea: boolean
  isRichText: boolean
  isReadOnly: boolean
  isSelectFalse: boolean // 不查询字段
  isSystemPreset: boolean
  isInteger: boolean
  isFloat: boolean
  isHidden: boolean
  [key: string]: any
}

export type DBModelField = {
  id: string
  /**
   * 数据库相关
   */
  db: KLDBField
  /**
   * 关联关系
   * @example User -> Profile 一对一
   * @example User -> Post 一对多
   * @example Post -> Tag 多对多
   */
  relations?: {
    /**
     * 关联类型
     */
    relationType: 'OneToOne' | 'OneToMany' | 'ManyToMany'
    /**
     * 关联表
     * @example User -> Profile: Profile
     * @example User -> Post: Post
     * @example Post -> Tag: Tag
     */
    relationModel: string
    /**
     * 仅多对多，自身引用目标模型的字段
     * @example Post -> Tag: tagId
     */
    selfRefField?: string
    /**
     * 目标关联模型中引用当前模型的字段
     * @example User -> Profile: userId
     * @example User -> Post: userId
     * @example Post -> Tag: postId
     */
    targetRefField: string
    /**
     * 目标关联模型中引用当前模型的名称字段
     * @example User -> Profile: user
     * @example User -> Post: user
     * @example Post -> Tag: posts
     */
    targetRefName: string
    /**
     * 自身被引用字段
     * @example User -> Profile: id
     * @example User -> Post: id
     * @example Post -> Tag: id
     */
    selfRelationField: string
    /**
     * 仅多对多，目标模型被引用字段
     * @example Post -> Tag: id
     */
    targetRelationField?: string
  }
  /**
   * 页面展示
   */
  display?: {
    /**
     * 是否在接口返回中去除
     */
    omitInApi?: boolean
    /**
     * 是否列表显示
     */
    showInList?: boolean
    /**
     * 是否在表单展示
     */
    showInForm?: boolean
    /**
     * 是否在搜索条件中展示
     */
    showInSearch?: boolean
    /**
     * 是否只读
     */
    readonly?: boolean
    /**
     * 是否可排序
     */
    sortable?: boolean
    /**
     * 控件类型
     */
    componentType?: string
    /**
     * 控件长度
     */
    componentWidth?: number
    /**
     * 控件默认值
     */
    componentDefaultValue?: any
    /**
     * 控件其余参数
     */
    componentProps?: Record<string, any>
  }
  /**
   * 约束
   */
  constraints?: {
    /**
     * 约束类型
     */
    type:
      | 'enum'
      | 'range'
      | 'length'
      | 'regexp'
      | 'function'
      | 'class-validator'
    /**
     * 枚举值
     */
    enum?: string[]
    /**
     * 数值范围
     */
    range?: [number | undefined, number | undefined]
    /**
     * 长度
     */
    length?: [number | undefined, number | undefined]
    /**
     * 正则
     */
    regexp?: string
    /**
     * 模版字符串函数
     */
    function?: string
    /**
     * 基于 class-validator 的规则
     */
    classValidator?: string
  }[]
  /**
   * 数据
   */
  data?: {
    /**
     * 数据来源表
     */
    sourceModel: string
    /**
     * 数据标题映射字段
     */
    titleField: string
    /**
     * 数据值映射字段
     */
    valueField: string
    /**
     * 筛选条件
     */
    query?: object
    /**
     * 数值转换
     */
    transform?: string
  }
  /**
   * Mock
   */
  mock?: {
    /**
     * Mock所用的库
     */
    library?: 'Mock.js' | 'chance'
    /**
     * Mock表达式
     */
    expression?: string
  }
}

export type ModelConfigurations = {
  database: DBConnectionConfig
  models: DBModel[]
}
