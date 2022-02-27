import type { CSSProperties, FC } from 'react'
import { Footer } from '@/Footer'
import styles from './App.module.less'
import logo from './logo.svg'
import './App.less'

type AppProps = {
  style?: CSSProperties
}

export const App: FC<AppProps> = ({ children, style }) => {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className={styles['app-link']}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}
