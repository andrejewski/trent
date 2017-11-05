import test from 'ava'
import {createSpec, createCustomCheck} from '../src'

test('first example', t => {
  const Matrix = createSpec(() => [[Number]])

  const errors = Matrix.getErrors([
    [1, 2, 3],
    [4, 5, 'wrong']
  ])

  t.is(errors.length, 1)
  t.is(errors[0].message, 'Value[1][2] must be of type "number"')
})

test('is() example', t => {
  const Eight = createSpec(({is}) => is(8))
  const errors = Eight.getErrors(8)
  t.is(errors.length, 0)
})

test('or() example', t => {
  const NumberOrString = createSpec(({or}) => or([Number, String]))
  const errors = NumberOrString.getErrors(8)
  t.is(errors.length, 0)
})

test('and() example', t => {
  const Eight = createSpec(({and, is}) => and([Number, is(8)]))
  const errors = Eight.getErrors(8)
  t.is(errors.length, 0)
})

test('not() example', t => {
  const Eight = createSpec(({not, is}) => not(is(9)))
  const errors = Eight.getErrors(8)
  t.is(errors.length, 0)
})

test('maybe() example', t => {
  const Eight = createSpec(({maybe, is}) => maybe(is(8)))
  t.is(Eight.getErrors(8).length, 0)
  t.is(Eight.getErrors(null).length, 0)
  t.is(Eight.getErrors(undefined).length, 0)
})

test('nullable() example', t => {
  const Eight = createSpec(({nullable, is}) => nullable(is(8)))
  t.is(Eight.getErrors(8).length, 0)
  t.is(Eight.getErrors(null).length, 0)
})

test('voidable() example', t => {
  const Eight = createSpec(({voidable, is}) => voidable(is(8)))
  t.is(Eight.getErrors(8).length, 0)
  t.is(Eight.getErrors(undefined).length, 0)
})

test('createCustomCheck() example', t => {
  const lowercase = createCustomCheck({
    descriptor: 'lowercase',
    isValid (x) {
      return typeof x === 'string' && x.toLowerCase() === x
    }
  })

  const Code = createSpec(() => lowercase)
  t.is(Code.getErrors('8').length, 0)
})
