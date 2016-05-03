#!/usr/bin/env node
'use strict'

const child  = require('child_process')
const fs     = require('fs')
const config = require('config')

try {
	const s = fs.statSync('redis.pid')
	if (s && s.isFile()) {
		process.stdout.write('Redis seems to be running.\n')
		process.exit(1)
	}
} catch (e) {}

const db = child.spawn('redis-server',
	['--port', config.redis.port, '--dir', config.redis.dir],
	{stdio: 'ignore', detached: true})
fs.writeFileSync('redis.pid', db.pid)
db.unref()

process.stdout.write('Redis listening on port 6379.\n')
