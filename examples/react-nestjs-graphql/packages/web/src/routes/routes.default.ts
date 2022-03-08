import type { RouteConfigItem } from '@/types'

export const routes: RouteConfigItem = [
  {
    path: '/p/article',
    exact: true,
    name: 'ArticlePage',
    component: 'Article/index'
  },
  {
    path: '/p/tag',
    exact: true,
    name: 'TagPage',
    component: 'Tag/index'
  }
]
