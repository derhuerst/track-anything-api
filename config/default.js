'use strict'

const path = require('path')

module.exports = {
	redis: {
		port: 6379,
		dir:  path.join(__dirname, '..')
	},
	port: 8002,
	domain: '<domain>'
}
