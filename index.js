'use strict'

const cfg     = require('config')
const express = require('express')
const body    = require('body-parser')
const shortid = require('shortid')

const auth    = require('./lib/auth')
const data    = require('./lib/data')



const noEmail = {status: 'error', msg: 'Missing email.'}
const noToken = {status: 'error', msg: 'Missing token.'}

const onError = (req, res, err, status = 500) => {
	console.error(err.message)
	res.status(status).json({status: 'error', msg: err.message})
}
const onSuccess = (req, res, msg, status = 200) => {
	console.info(msg)
	res.status(status).json({status: 'ok', msg: msg})
}

const app = express()
	.use(body.urlencoded({extended: false}))



// request a token
app.post('/tokens', (req, res) => {
	if (!req.body.email) return res.status(400).json(noEmail)
	const id = shortid.generate()
	auth.generate(id, req.body.email)
	.catch((err) => onError(req, res, err))
	.then((msg) => onSuccess(req, res, msg, 202))
})

app.get('/tokens', (req, res) => res.end(`
<form action="/tokens" method="post">
	<input type="email" name="email" placeholder="email"/>
	<input type="submit" value="request token"/>
</form>
`))

// create a new tracker
app.post('/trackers', (req, res) => {
	if (!req.body.id) return res.status(400).json(noTracker)
	if (!req.body.token) return res.status(400).json(noToken)
	auth.activate(req.body.id, req.body.token)
	.catch((err) => onError(req, res, err))
	.then((msg) => onSuccess(req, res, msg, 201))
})

// increment a tracker
app.post('/trackers/:id', (req, res) => {
	if (!req.params.id) return res.status(400).json(noTracker)
	if (!req.body.key) return res.status(400).json(noKey)
	data.inc(req.params.id, req.body.key)
	.catch((err) => onError(req, res, err))
	.then((data) => onSuccess(req, res, data))
})

// read a tracker
app.get('/trackers/:id', (req, res) => {
	if (!req.params.id) return res.status(400).json(noTracker)
	data.get(req.params.id)
	.catch((err) => onError(req, res, err))
	.then((data) => onSuccess(req, res, data))
})



app.listen(cfg.port, () =>
	console.log(`Listening on port ${cfg.port}.`))
