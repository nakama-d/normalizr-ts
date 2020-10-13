// Determine if input is a js object
export function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj)
}

// Determine if input is a plain object
export function isPlainObject(obj: any) {
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
