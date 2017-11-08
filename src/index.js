import {
  getErrors,
  replaceMatcher
} from './check'
import {
  is,
  or,
  and,
  not,
  maybe,
  tuple,
  nullable,
  voidable,
  asSpec,
  asMatcher,
  getMatcher,
  asCustomMatcher
} from './core'

export const createCustomCheck = asCustomMatcher

export function createSpec (buildSpec) {
  const library = {
    is,
    or,
    and,
    not,
    maybe,
    tuple,
    nullable,
    voidable
  }
  const spec = buildSpec(library)
  const matcher = getMatcher(spec)
  return asSpec(matcher, {
    getErrors (value) {
      const errors = []
      getErrors(matcher, value, errors, {subject: 'Value', isInverted: false})
      return errors
    }
  })
}

export function createDependentSpecs (buildSpecs) {
  const ref = refName => asMatcher({type: 'ref', data: refName})
  const library = {
    is,
    or,
    and,
    not,
    ref,
    maybe,
    tuple,
    nullable,
    voidable
  }
  const refSpecs = buildSpecs(library)
  const matchers = {}
  for (let refName in refSpecs) {
    matchers[refName] = getMatcher(refSpecs[refName])
  }
  const specs = {}
  for (let key in matchers) {
    const matcher = matchers[key]
    replaceMatcher(matcher, 'ref', node => {
      const ref = node.data
      const matcher = matchers[ref]
      for (let key in node) {
        delete node[key]
      }
      for (let key in matcher) {
        node[key] = matcher[key]
      }
      node.__isTerminal = true
    })
    specs[key] = asSpec(matcher, {
      getErrors (value) {
        const errors = []
        getErrors(matcher, value, errors, {subject: 'Value', isInverted: false})
        return errors
      }
    })
  }
  return specs
}
