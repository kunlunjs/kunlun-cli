import type { CSSProperties, FC } from 'react'
import { Test } from 'src/Test'

type AppProps = {
  style?: CSSProperties
}

export const App: FC<AppProps> = ({ children, style }) => {
  return (
    <div style={style}>
      <Test />
      {children}
    </div>
  )
}
