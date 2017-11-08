# Trent
> Type specifications

```sh
npm install trent
```

[![npm](https://img.shields.io/npm/v/trent.svg)](https://www.npmjs.com/package/trent)
[![Build Status](https://travis-ci.org/andrejewski/trent.svg?branch=master)](https://travis-ci.org/andrejewski/trent)
[![Greenkeeper badge](https://badges.greenkeeper.io/andrejewski/trent.svg)](https://greenkeeper.io/)

This library provides runtime type specifications with a focus on:

- A small, native-feeling syntax for defining specifications
- Good error messages

## Usage

```js
import {createSpec} from 'trent'

const Matrix = createSpec(() => [[Number]])

const errors = Matrix.getErrors([
  [1, 2, 3],
  [4, 5, 'wrong']
])

console.log(errors)
/* => [ Error('Value[1][2] must be of type "number"') ] */
```

## Documentation

### `createSpec(builder: builtInChecks -> Check): Spec`
Create a `Spec` using the `builder` function which receives the built-in checks described below. The builder must return a valid check or an error throws. The `Spec` object returned has a method `getErrors(value)` which returns an array of type errors for `value`.

### Checks
- Value checks
  - [`Spec`](#spec)
  - [`Constructor`](#constructor)
  - [Array `[check]`](#array-check)
  - [Object `{key: check, ..., keyN: checkN}`](#object-key-check--keyn-checkn)
- Built-in checks
  - [`is(value : any)`](#isvalue--any)
  - [`or(checks : [Check])`](#orchecks--check)
  - [`and(checks : [Check])`](#andchecks--check)
  - [`not(check: Check)`](#notcheck--check)
  - [`maybe(check : Check)`](#maybecheck--check)
  - [`tuple(checks : [Check])`](#tuplechecks--check)
  - [`nullable(check : Check)`](#nullablecheck--check)
  - [`voidable(check : Check)`](#voidablecheck--check)
- Custom checks
  - [Using `checkCustomCheck({descriptor: String, isValid: Function})`](#using-checkcustomcheckdescriptor-string-isvalid-function)

---

#### `Spec`
Check that a provided value matches the `Spec`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Num = createSpec(() => Number)
const Matrix = createSpec(() => [[Num]])

const errors = Matrix.getErrors([[1, 2, 3], [4, 5, 6]])
assert(errors.length === 0)
```

---

#### `Constructor`
Check that a provided value is an `instanceof Constructor`, or `typeof` if the constructor is for a primitive such as `Number` or `String`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Num = createSpec(() => Number)
const errors = Num.getErrors(8)
assert(errors.length === 0)
```

*Note:* Any Constructor will work if `root[Constructor.name] === Constructor` where `root` is the `window` in browsers and `global` in Node.

---

#### Array `[check]`
Check that a provided value is an array where every element passes the `check`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Numbers = createSpec(() => [Number])
const errors = Numbers.getErrors([8])
assert(errors.length === 0)
```

---

#### Object `{key: check, ..., keyN: checkN}`
Check that a provided value is an object where every `key` value passes its `check`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Point = createSpec(() => ({x: Number, y: Number}))
const errors = Point.getErrors({x: 8, y: 8})
assert(errors.length === 0)
```

---

#### `is(value : any)`
Check that a provided value must strictly equal (`===`) the `value`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({is}) => is(8))
const errors = Eight.getErrors(8)
assert(errors.length === 0)
```

---

#### `or(checks : [Check])`
Check that a provided value matches at least one of the `checks`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const NumberOrString = createSpec(({or}) => or([Number, String]))
const errors = NumberOrString.getErrors(8)
assert(errors.length === 0)
```

---

#### `and(checks : [Check])`
Check that a provided value matches at every one of the `checks`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({and, is}) => and([Number, is(8)]))
const errors = Eight.getErrors(8)
assert(errors.length === 0)
```

---

#### `not(check : Check)`
Check that a provided value does not pass the `check`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({not, is}) => not(is(9)))
const errors = Eight.getErrors(8)
assert(errors.length === 0)
```

---

#### `maybe(check : Check)`
Check that a provided value matches `check` or is `null` or `undefined`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({maybe, is}) => maybe(is(8)))
assert(Eight.getErrors(8).length === 0)
assert(Eight.getErrors(null).length === 0)
assert(Eight.getErrors(undefined).length === 0)
```

---

#### `tuple(checks : [Check])`
Check that a provided value is an array with length equal to `checks.length` and the first element passes the first check and so on.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({tuple, is}) => tuple([is(8), is(8)]))
assert(Eight.getErrors([8, 8]).length === 0)
```

---

#### `nullable(check : Check)`
Check that a provided value matches `check` or is `null`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({nullable, is}) => nullable(is(8)))
assert(Eight.getErrors(8).length === 0)
assert(Eight.getErrors(null).length === 0)
```

---

#### `voidable(check : Check)`
Check that a provided value matches `check` or is `undefined`.

```js
import {createSpec} from 'trent'
import assert from 'assert'

const Eight = createSpec(({voidable, is}) => voidable(is(8)))
assert(Eight.getErrors(8).length === 0)
assert(Eight.getErrors(undefined).length === 0)
```

---

#### Using `checkCustomCheck({descriptor: String, isValid: Function})`
Create a check where `descriptor` fits the sentence `{subject} must be {descriptor}` for error messages and `isValid(value: any)` returns whether the value passes the check.

```js
import {createSpec, createCustomCheck} from 'trent'
import assert from 'assert'

const lowercase = createCustomCheck({
  descriptor: 'lowercase',
  isValid (x) {
    return typeof x === 'string' && x.toLowerCase() === x
  }
})

const Code = createSpec(() => lowercase)
assert(Code.getErrors('8').length === 0)
```

*Note:* Custom checks cannot nest checks within them. In a tree structure analogy, custom checks must be leaves. The reason for this limitation is the complexity of creating good error messages.

### `createDependentSpecs(builder : builtInChecks -> {Check}) {Spec}`
Create a collection of `Spec`s which are dependent and/or recursive.

For example, we have two types `Foo` and `Bar` which both can contain each other. We can try to write this system with `createSpec`:

```js
import {createSpec} from 'trent'
var Foo = createSpec(() => ({barList: [Bar]}))
var Bar = createSpec(() => ({fooList: [Foo]}))
```

Creating `Foo` with undefined `Bar` will not work. We need `createDependentSpecs` to enable a "late-binding" where order does not matter. We use the `ref` built-in check available to `createDependentSpecs` to reference `Spec`s.

```js
import {createDependentSpecs} from 'trent'
import assert from 'assert'
const {Foo} = createDependentSpecs(({ref}) => ({
  Foo: {barList: [ref('Bar')]},
  Bar: {fooList: [ref('Foo')]}
}))

assert(Foo.getErrors({
  barList: [{
    fooList: [{
      barList: [{
        fooList: []
      }]
    }]
  }]
}).length === 0)
```

#### Real-life example
I maintain the HTML parser [Himalaya](https://github.com/andrejewski/himalaya) which follows a strict [specification](https://github.com/andrejewski/himalaya/blob/master/text/ast-spec-v1.md) for its output. The output contains Nodes which can have children Nodes, so we need a recursive type.

```js
import {
  createSpec,
  createDependentSpecs
} from 'trent'

// I pull this out to show that you can
const Text = createSpec(({is}) => ({
  type: is('text'),
  content: String
}))

export const {Node} = createDependentSpecs(({is, or, ref, nullable}) => ({
  Node: or([
    ref('Element'),
    ref('Comment'),
    Text
  ]),
  Element: {
    type: is('element'),
    tagName: String,
    children: [ref('Node')],
    attributes: [{
      key: String,
      value: nullable(String)
    }]
  },
  Comment: {
    type: is('comment'),
    content: String
  }
}))
```
