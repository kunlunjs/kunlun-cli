import { useMemo } from 'react'
import type { CommonField } from '@/types'
// import styles from './index.module.less'

const ArticlePage = () => {
  const fields = useMemo<CommonField[]>(() => {
    return [
      {
        name: 'id',
        title: 'ID',
        required: true,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'title',
        title: '标题',
        required: false,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: 'false'
      },
      {
        name: 'content',
        title: '内容',
        required: false,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: 'false'
      },
      {
        name: 'sort',
        title: '排序',
        required: false,
        type: 'number',
        defaultValue: '0',
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'createdBy',
        title: '创建人',
        required: true,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'createdAt',
        title: '创建时间',
        required: true,
        type: 'date',
        defaultValue: 'now()',
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'updatedBy',
        title: '更新人',
        required: true,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'updatedAt',
        title: '更新时间',
        required: true,
        type: 'date',
        defaultValue: 'now()',
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'deletedBy',
        title: '删除人',
        required: true,
        type: 'string',
        defaultValue: undefined,
        tooltip: undefined,
        isArray: undefined
      },
      {
        name: 'deletedAt',
        title: '删除时间',
        required: true,
        type: 'date',
        defaultValue: 'now()',
        tooltip: undefined,
        isArray: undefined
      }
    ]
  }, [])

  return (
    <Page>
      <PageDataProvider fields={fields}>
        <PageDataSearchForm />
        <PageDataTable actions={['create', 'import', 'export']} />
      </PageDataProvider>
    </Page>
  )
}

export default ArticlePage
