'use strict'

const redis = require('then-redis')
const cfg   = require('config')
const co    = require('co').wrap
const a     = require('assert')

const db = redis.createClient({port: cfg.redis.port})
db.on('error', (err) => console.error(err.message))



module.exports = {

	  add: co(function* (id, key) {
		a.ok(!(yield db.exists(id)), `Tracker ${id} already exists.`)
		yield db.set(id, 0)
		yield db.set('key:' + id, key)
		return {msg: `Added tracker ${id}.`}
	})
	, rm: co(function* (id, key) {
		a.ok(yield db.exists(id), `Tracker ${id} doesn\'t exist.`)
		a.strictEqual(key, yield db.get('key:' + id),
			`Invalid key for tracker ${id}.`)
		yield db.del(id)
		yield db.del('key:' + id)
		return {msg: `Deleted tracker ${id}.`}
	})

	, inc: co(function* (id, key) {
		a.ok(yield db.exists(id), `Tracker ${id} doesn\'t exist.`)
		a.strictEqual(key, yield db.get('key:' + id),
			`Invalid key for tracker ${id}.`)
		yield db.incr(id)
		return {msg: `Incremented tracker ${id}.`}
	})

	, get: co(function* (id) {
		a.ok(yield db.exists(id), `Tracker ${id} doesn\'t exist.`)
		return {value: parseInt(yield db.get(id))}
	})

}
