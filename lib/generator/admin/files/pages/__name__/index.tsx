import { useMemo } from 'react'
import { CommonField } from '@/types'
// import styles from './index.module.less'

const <%= it.camelize(it.name, true) %>Page = () => {
  const fields = useMemo<CommonField[]>(() => {
    return [
      <% it.fields.forEach(function(field, index) { %>
      {
        name: '<%= field.db.name %>',
        title: '<%= field.db.title %>',
        required: <%= !field.db.nullable %>,
        type: <%~ it.safeString(it.getType(field)) %>,
        defaultValue: <%~ it.safeString(field.db.defaultValue) %>,
        tooltip: <%~ it.safeString(field.db.description) %>,
        isArray: <%~ it.safeString(field.db.isArray) %>,
      },
      <% }) %>
    ]
  }, [])

  return (
    <Page>
      <PageDataProvider fields={fields}>
        <PageDataSearchForm />
        <PageDataTable actions={ ['create', 'import', 'export'] } />
      </PageDataProvider>
    </Page>
  )
}

export default <%= it.camelize(it.name, true) %>Page
