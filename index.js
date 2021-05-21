module.exports = class MaxCache {
  constructor ({ maxSize, maxAge }) {
    this.maxSize = maxSize
    this.maxAge = maxAge

    this._latest = new Map()
    this._oldest = new Map()
    this._gced = false
    this._interval = null

    if (this.maxAge > 0 && this.maxAge < Infinity) {
      const tick = Math.ceil(2 / 3 * this.maxAge)
      this._interval = setInterval(this._gcAuto.bind(this), tick)
      if (this._interval.unref) this._interval.unref()
    }
  }

  [Symbol.iterator] () {
    return new Iterator(this._latest[Symbol.iterator](), this._oldest[Symbol.iterator]())
  }

  keys () {
    return new Iterator(this._latest.keys(), this._oldest.keys())
  }

  values () {
    return new Iterator(this._latest.values(), this._oldest.values())
  }

  destroy () {
    this.clear()
    clearInterval(this._interval)
    this._interval = null
  }

  clear () {
    this._gc()
    this._gc()
  }

  set (k, v) {
    this._latest.set(k, v)
    this._oldest.delete(k)
    if (this._latest.size >= this.maxSize) this._gc()
  }

  delete (k) {
    return this._latest.delete(k) || this._oldest.delete(k)
  }

  get (k) {
    let bump = false
    let v = this._latest.get(k)

    if (!v) {
      v = this._oldest.get(k)
      if (!v) return null
      bump = true
    }

    if (bump) {
      this._latest.set(k, v)
      this._oldest.delete(k)
    }

    return v
  }

  _gcAuto () {
    if (!this._gced) this._gc()
    this._gced = false
  }

  _gc () {
    this._gced = true
    this._oldest = this._latest
    this._latest = new Map()
  }
}

class Iterator {
  constructor (a, b) {
    this.a = a
    this.b = b
  }

  [Symbol.iterator] () {
    return this
  }

  next () {
    if (this.a !== null) {
      const n = this.a.next()
      if (!n.done) return n
      this.a = null
    }
    return this.b.next()
  }
}
