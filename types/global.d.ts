/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | string
    readonly PUBLIC_PATH: string
    readonly BUILD_PATH: string
    readonly FAST_REFRESH: string
    readonly WDS_SOCKET_HOST: string
    readonly BUNDLE_ANALYZER: string
    readonly GENERATE_SOURCEMAP: string
    readonly INLINE_RUNTIME_CHUNK: string
    readonly TSC_COMPILE_ON_ERROR: string
    readonly IMAGE_INLINE_SIZE_LIMIT: string
    readonly DISABLE_NEW_JSX_TRANSFORM: string
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.svg' {
  import type * as React from 'react'

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
    > & { title?: string }>
  
  const src: string
  export default src
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.module.less' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.module.scss' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.module.sass' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}