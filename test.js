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
