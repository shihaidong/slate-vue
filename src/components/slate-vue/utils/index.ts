export function top(e: string) {
  return e.replace(/\B[A-Z]/g, (s) => {
    return `-${s.toLowerCase()}`
  })
}

export * from './Vue_Editor'

export * from './util'

export * from './HotKeys'

export * from './KeyEvent'


export * from './formatOperation'
export * from './formatRender'