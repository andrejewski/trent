const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]'
const root = isNode ? global : window
const typeofTypes = {
  Number: 1,
  Object: 1,
  String: 1,
  Symbol: 1,
  Boolean: 1,
  Function: 1
}

export function isSpec (obj) {
  return !!(obj && obj.__isSpec)
}

export function asSpec (matcher, obj) {
  obj.__isSpec = true
  obj.__matcher = matcher
  return obj
}

export function isMatcher (obj) {
  return !!(obj && obj.__isMatcher)
}

export function asMatcher (obj) {
  obj.__isMatcher = true
  return obj
}

export function isCustomMatcher (obj) {
  return !!(obj && obj.__isCustomMatcher)
}

export function asCustomMatcher (obj) {
  return {
    __isCustomMatcher: true,
    type: 'custom',
    data: obj
  }
}

export function getMatcher (type) {
  if (isSpec(type)) {
    return type.__matcher
  }

  if (isMatcher(type)) {
    return type
  }

  if (isCustomMatcher(type)) {
    return asMatcher({type: type.type, data: type.data})
  }

  if (typeof type === 'function') {
    const name = type.name
    const Type = root[name]
    if (Type === type) {
      if (typeofTypes[name]) {
        return asMatcher({type: 'typeof', data: name.toLowerCase()})
      }
      return asMatcher({
        type: 'instanceof',
        data: {constructor: Type, descriptor: name}
      })
    }
  }

  if (Array.isArray(type)) {
    const matcher = getMatcher(type[0])
    return asMatcher({type: 'array', data: matcher})
  }

  if (typeof type === 'object') {
    const matcherMap = {}
    for (let key in type) {
      matcherMap[key] = getMatcher(type[key])
    }
    return asMatcher({type: 'object', data: matcherMap})
  }

  throw new Error(`Unrecognized type ${type}`)
}

export function is (any) {
  return asMatcher({type: 'is', data: any})
}

export function or (types) {
  const matchers = types.map(getMatcher)
  return asMatcher({type: 'or', data: matchers})
}

export function and (types) {
  const matchers = types.map(getMatcher)
  return asMatcher({type: 'and', data: matchers})
}

export function not (type) {
  const matcher = getMatcher(type)
  return asMatcher({type: 'not', data: matcher})
}

export function maybe (type) {
  const matcher = getMatcher(type)
  return or([matcher, is(null), is(undefined)])
}

export function tuple (types) {
  const matchers = types.map(getMatcher)
  return asMatcher({type: 'tuple', data: matchers})
}

export function nullable (type) {
  const matcher = getMatcher(type)
  return or([matcher, is(null)])
}

export function voidable (type) {
  const matcher = getMatcher(type)
  return or([matcher, is(undefined)])
}
