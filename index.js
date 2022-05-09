module.exports = class MaxCache {
  constructor ({ maxSize, maxAge }) {
    this.maxSize = maxSize
    this.maxAge = maxAge

    this._latest = new Map()
    this._oldest = new Map()
    this._retained = new Map()
    this._gced = false
    this._interval = null

    if (this.maxAge > 0 && this.maxAge < Infinity) {
      const tick = Math.ceil(2 / 3 * this.maxAge)
      this._interval = setInterval(this._gcAuto.bind(this), tick)
      if (this._interval.unref) this._interval.unref()
    }
  }

  * [Symbol.iterator] () {
    for (const it of [this._latest, this._oldest, this._retained]) {
      yield * it
    }
  }

  * keys () {
    for (const it of [this._latest, this._oldest, this._retained]) {
      yield * it.keys()
    }
  }

  * values () {
    for (const it of [this._latest, this._oldest, this._retained]) {
      yield * it.values()
    }
  }

  destroy () {
    this.clear()
    clearInterval(this._interval)
    this._interval = null
  }

  clear () {
    this._gced = true
    this._latest.clear()
    this._oldest.clear()
    this._retained.clear()
  }

  set (k, v) {
    if (this._retained.has(k)) return this
    this._latest.set(k, v)
    this._oldest.delete(k) || this._retained.delete(k)
    if (this._latest.size >= this.maxSize) this._gc()
    return this
  }

  retain (k, v) {
    this._retained.set(k, v)
    this._latest.delete(k) || this._oldest.delete(k)
    return this
  }

  delete (k) {
    return this._latest.delete(k) || this._oldest.delete(k) || this._retained.delete(k)
  }

  has (k) {
    return this._latest.has(k) || this._oldest.has(k) || this._retained.has(k)
  }

  get (k) {
    if (this._latest.has(k)) {
      return this._latest.get(k)
    }

    if (this._oldest.has(k)) {
      const v = this._oldest.get(k)
      this._latest.set(k, v)
      this._oldest.delete(k)
      return v
    }

    if (this._retained.has(k)) {
      return this._retained.get(k)
    }
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
