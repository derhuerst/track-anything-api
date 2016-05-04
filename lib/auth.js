'use strict'

const cfg     = require('config')
const mailgun = require('mailgun-js')
const redis   = require('then-redis')
const co      = require('co').wrap
const a       = require('assert')
const shortid = require('shortid')
const uuid    = require('uuid')

const data    = require('./data')

const mails = mailgun({
	apiKey: cfg.mailgun.key,
	domain: cfg.mailgun.domain
}).messages()

const db = redis.createClient({port: cfg.redis.port})
db.on('error', (err) => console.error(err.message))

const minute = 60 * 1000



const mail = (to, id, token) => new Promise((yay, nay) => {
	const from    = 'no-reply@' + cfg.domain
	const subject = 'Token for your tracker ' + id
	const text    = `Hey!

Create your tracker ${id} using the following token:

${token}

Ignore this email if you don't know what this is about.`
	mails.send({from, to, subject, text}, (err) => {
		if (err) nay(err)
		else yay()
	})
})

const generate = co(function* (id, email) {
	a.ok(!(yield db.exists(id)), `Tracker ${id} already exists.`)
	const token = shortid.generate() + shortid.generate()
	yield db.set('token:' + id, token)
	yield db.expire('token:' + id, 10 * minute)
	yield mail(email, id, token)
	return {msg: `Sent token for tracker ${id} to ${email}.`}
})

const activate = co(function* (id, token) {
	a.strictEqual(token, yield db.get('token:' + id),
		`Invalid or expired token for tracker ${id}.`)
	const key = uuid.v4()
	yield data.del('token:' + id)
	yield data.add(id, key)
	return {key, msg: `Created key ${key} for tracker ${id}.`}
})



module.exports = {generate, activate}
