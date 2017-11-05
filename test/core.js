import test from 'ava'
import * as core from '../src/core'

test('core should contain the builder library', t => {
  t.is(typeof core.is, 'function')
  t.is(typeof core.or, 'function')
  t.is(typeof core.and, 'function')
  t.is(typeof core.not, 'function')
  t.is(typeof core.maybe, 'function')
  t.is(typeof core.nullable, 'function')
  t.is(typeof core.voidable, 'function')
})

test('isSpec(value) should return whether value is a Spec', t => {
  const {isSpec} = core

  t.true(isSpec({
    __isSpec: true
  }))

  t.false(isSpec(undefined))
  t.false(isSpec(null))
  t.false(isSpec({}))
})

test('core library methods should return schemas', t => {
  const node = (type, data) => core.asMatcher({type, data})

  t.deepEqual(core.is(8), node('is', 8))
  t.deepEqual(
    core.or([core.is(4), core.is(6)]),
    node('or', [node('is', 4), node('is', 6)])
  )
  t.deepEqual(
    core.and([core.is(4), core.is(6)]),
    node('and', [node('is', 4), node('is', 6)])
  )
  t.deepEqual(
    core.not(core.is(8)),
    node('not', node('is', 8))
  )
  t.deepEqual(
    core.maybe(core.is(4)),
    node('or', [node('is', 4), node('is', null), node('is', undefined)])
  )
  t.deepEqual(
    core.nullable(core.is(4)),
    node('or', [node('is', 4), node('is', null)])
  )
  t.deepEqual(
    core.voidable(core.is(4)),
    node('or', [node('is', 4), node('is', undefined)])
  )
  t.deepEqual(
    core.tuple([core.is(4), core.is(1)]),
    node('tuple', [node('is', 4), node('is', 1)])
  )
})
