import type { CSSProperties } from 'react'
import ReactDOM from 'react-dom'
import { App } from './App'
import './index.css'

const style: CSSProperties = { width: 100, height: 100, background: 'red' }

ReactDOM.render(<App style={style}></App>, document.getElementById('root'))
