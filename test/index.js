import test from 'ava'
import {createSpec, createCustomCheck} from '../src'

test('getErrors() should return an array of errors for an invalid value', t => {
  const Color = createSpec(() => String)
  const errors = Color.getErrors(8)
  t.is(errors.length, 1)
  t.true(errors[0] instanceof Error)
})

test('getErrors() should return an empty array for a valid value', t => {
  const Color = createSpec(() => String)
  const errors = Color.getErrors('blue')
  t.is(errors.length, 0)
})

test('custom conditions should integrate into schemas', t => {
  const lowercase = createCustomCheck({
    descriptor: 'lowercase',
    isValid (x) {
      return typeof x === 'string' && x.toLowerCase() === x
    }
  })

  const Code = createSpec(() => lowercase)
  {
    const errors = Code.getErrors('cake')
    t.is(errors.length, 0)
  }
  {
    const errors = Code.getErrors('Cake')
    t.is(errors.length, 1)
    t.is(errors[0].message, 'Value must be lowercase')
  }

  const NotCode = createSpec(({not}) => not(Code))
  {
    const errors = NotCode.getErrors(8)
    t.is(errors.length, 0)
  }
  {
    const errors = NotCode.getErrors('cake')
    t.is(errors.length, 1)
    t.is(errors[0].message, 'Value must not be lowercase')
  }
})
