'use strict'

const cfg     = require('config')
const express = require('express')
const body    = require('body-parser')
const shortid = require('shortid')

const auth    = require('./lib/auth')
const data    = require('./lib/data')



const noEmail   = {status: 'error', msg: 'Missing email.'}
const noToken   = {status: 'error', msg: 'Missing token.'}
const noTracker = {status: 'error', msg: 'Missing tracker id.'}
const noKey     = {status: 'error', msg: 'Missing key.'}

const onError = (req, res, err, status = 500) => {
	console.error(err.message)
	res.status(status).json({status: 'error', msg: err.message})
}
const onSuccess = (req, res, data, status = 200) => {
	data = Object.assign({status: 'ok', msg: 'Done.'}, data)
	console.info(data.msg)
	res.status(status).json(data)
}

const app = express()
	.use(body.urlencoded({extended: false}))



// request a token
app.post('/tokens', (req, res) => {
	if (!req.body.email) return res.status(400).json(noEmail)
	const id = shortid.generate()
	auth.generate(id, req.body.email)
	.catch((err) => onError(req, res, err))
	.then((data) => onSuccess(req, res, data, 202))
})

// create a new tracker
app.post('/trackers', (req, res) => {
	if (!req.body.id) return res.status(400).json(noTracker)
	if (!req.body.token) return res.status(400).json(noToken)
	auth.activate(req.body.id, req.body.token)
	.catch((err) => onError(req, res, err))
	.then((data) => onSuccess(req, res, data, 201))
})

// increment a tracker
app.patch('/trackers/:id', (req, res) => {
	if (!req.params.id) return res.status(400).json(noTracker)
	if (!req.body.key) return res.status(400).json(noKey)
	data.track(req.params.id, req.body.key)
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
