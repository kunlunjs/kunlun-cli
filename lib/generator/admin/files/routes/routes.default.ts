import type { RouteConfigItem } from '@/types'

export const routes: RouteConfigItem = [
  <% it.models.forEach(function(model, index) { %>
  {
    path: '/p/<%= it.dasherize(it.underscore(it.shortName(model.name))) %>',
    exact: true,
    name: '<%= it.shortName(model.name) %>Page',
    component: '<%= it.shortName(model.name) %>/index'
  },
  <% }) %>
]
