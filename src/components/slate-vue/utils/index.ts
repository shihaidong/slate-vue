export function top(e: string) {
  return e.replace(/\B[A-Z]/g, (s) => {
    return `-${s.toLowerCase()}`
  })
}

export function mergeStyle(parent, children) {
  for(let key of children) {
    parent[key] = children[key]
  }
  return parent
}

export * from './Vue_Editor'