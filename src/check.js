export function isValid (schema, value) {
  const {type, data} = schema
  switch (type) {
    case 'is': return value === data
    case 'or': return data.some(matcher => isValid(matcher, value))
    case 'and': return data.every(matcher => isValid(matcher, value))
    case 'not': return !isValid(data, value)
    case 'array': return (
      Array.isArray(value) &&
      value.every(item => isValid(data, item))
    )
    case 'tuple':
      if (!(Array.isArray(value) && value.length === data.length)) {
        return false
      }
      for (let i = 0; i < data.length; i++) {
        if (!isValid(data[i], value[i])) {
          return false
        }
      }
      return true
    case 'object':
      for (let key in value) {
        if (!isValid(data[key], value[key])) {
          return false
        }
      }
      return true
    case 'custom': return data.isValid(value)
    case 'typeof': return (() => typeof value)() === data
    case 'constructor': return value instanceof data.constructor
  }
}

export function isDotPropertyName (name) {
  return /^[a-zA-Z0-9_$]*$/.test(name)
}

export function humanList (list, joint) {
  list = list.slice(0)
  const last = list.pop()
  if (list.length === 1) {
    return `${list[0]} ${joint} ${last}`
  }
  return list.join(', ') + `, ${joint} ` + last
}

export function getErrorMessage (schema, {subject, isInverted} = {}) {
  const {type, data} = schema
  if (type === 'not') {
    return getErrorMessage(data, {subject, isInverted: !isInverted})
  }

  if (subject) {
    const not = isInverted ? ' not' : ''
    return `${subject} must${not} be ${getErrorMessage(schema)}`
  }

  switch (type) {
    case 'is': return `${data}`
    case 'or': {
      if (data.length === 0) {
        return 'nothing'
      }

      const cases = data.map(schema => getErrorMessage(schema))
      return humanList(cases, 'or')
    }
    case 'and': {
      if (data.length === 0) {
        return 'anything'
      }

      const cases = data.map(schema => getErrorMessage(schema))
      return humanList(cases, 'and')
    }
    case 'array': return `an array where every element is ${getErrorMessage(data)}`
    case 'tuple': {
      const indexConditions = humanList(data.map((schema, index) =>
        `index ${index} is ${getErrorMessage(schema)}`
      ), 'and')
      return `an array of length ${data.length} where ${indexConditions}`
    }
    case 'object': {
      const keyConditions = humanList(Object.keys(data).map((key) =>
        `key ${key} is ${getErrorMessage(data[key])}`
      ), 'and')
      return `an object where ${keyConditions}`
    }
    case 'custom': return `${data.descriptor}`
    case 'typeof': return `of type "${data}"`
    case 'instanceof': return `an instance of ${data.descriptor}`
  }
}

export function getErrors (schema, value, errors, {subject, isInverted} = {}) {
  if (isValid(schema, value)) {
    return
  }

  const {type, data} = schema
  if (type === 'array' && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const options = {subject: `${subject}[${i}]`, isInverted}
      getErrors(data, value[i], errors, options)
    }
    return
  }

  if (type === 'tuple' && Array.isArray(value) && value.length === data.length) {
    for (let i = 0; i < value.length; i++) {
      const options = {subject: `${subject}[${i}]`, isInverted}
      getErrors(data[i], value[i], errors, options)
    }
    return
  }

  if (type === 'object' && typeof value === 'object') {
    for (let key in value) {
      const newSubject = isDotPropertyName(key) ? `${subject}.${key}` : `${subject}["${key}"]`
      const options = {subject: newSubject, isInverted}
      getErrors(data[key], value[key], errors, options)
    }
    return
  }

  const message = getErrorMessage(schema, {subject, isInverted})
  errors.push(new Error(message))
}

export function iterateMatcher (schema, fn) {
  if (schema.__isTerminal) {
    return
  }
  fn(schema)
  const {type, data} = schema
  switch (type) {
    case 'or': return data.forEach(matcher => iterateMatcher(matcher, fn))
    case 'and': return data.forEach(matcher => iterateMatcher(matcher, fn))
    case 'array': return iterateMatcher(data, fn)
    case 'tuple': return data.forEach(matcher => iterateMatcher(matcher, fn))
    case 'object':
      for (let key in data) {
        iterateMatcher(data[key], fn)
      }
  }
}

export function replaceMatcher (schema, type, fn) {
  iterateMatcher(schema, matcher => {
    if (matcher.type === type) {
      fn(matcher)
    }
  })
}
