const tape = require('tape')
const Xache = require('./')

tape('basic', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  c.set(1, true)
  c.set(2, true)
  c.set(3, true)
  c.set(4, true)

  t.same([...c], [[1, true], [2, true], [3, true], [4, true]])

  c.set(5, true)

  t.same([...c], [[5, true], [1, true], [2, true], [3, true], [4, true]], 'bumped the generations')

  c.set(2, true)

  t.same([...c], [[5, true], [2, true], [1, true], [3, true], [4, true]], 'bumped the key')

  c.set(6, true)
  c.set(7, true)

  t.same([...c], [[5, true], [2, true], [6, true], [7, true]])
  t.end()
})

tape('falsy values', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  for (const v of [null, undefined, false, 0, NaN, '']) {
    c.set(1, v)
    t.ok(c.has(1))
    t.same(c.get(1), v)
  }

  t.end()
})

tape('retain', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  c.retain(1, true)

  for (let i = 2; i < 10; i++) {
    c.set(i, true)
  }

  t.same([...c], [[6, true], [7, true], [8, true], [9, true], [1, true]])

  t.end()
})

tape('retain + set + get', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  c.retain(1, true)
  c.set(1, false)

  t.is(c.get(1), true)

  t.end()
})

tape('set + retain + get', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  c.set(1, false)
  c.retain(1, true)

  t.is(c.get(1), true)

  t.end()
})

tape('retain + clear + get', function (t) {
  const c = new Xache({
    maxSize: 4
  })

  c.retain(1, true)
  t.is(c.get(1), true)

  c.clear()
  t.is(c.get(1), undefined)

  t.end()
})
