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
		yield db.set('key:' + id, key)
		yield db.lpush(id, Date.now())
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

	, track: co(function* (id, key) {
		a.ok(yield db.exists(id), `Tracker ${id} doesn\'t exist.`)
		a.strictEqual(key, yield db.get('key:' + id),
			`Invalid key for tracker ${id}.`)
		yield db.lpush(id, Date.now())
		return {msg: `Incremented tracker ${id}.`}
	})

	, get: co(function* (id) {
		a.ok(yield db.exists(id), `Tracker ${id} doesn\'t exist.`)
		const values = (yield db.lrange(id, 0, -1)).map((d) => parseInt(d))
		return {values: values}
	})

}
