import { createApp } from 'vue'

export default createApp({
  name: 'VueApp',
  setup(props, ctx) {
    return () => (
      <div style={{ width: '100px', height: '100px', background: 'red' }} />
    )
  }
}).mount('#root')
