import {getErrors} from './check'
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
  getMatcher,
  asCustomMatcher
} from './core'

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

export const createCustomCheck = asCustomMatcher

export function createSpec (buildSpec) {
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
