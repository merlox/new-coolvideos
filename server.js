const express = require('express')
const bodyParser = require('body-parser')
const { join } = require('path')
const app = express()
const apiRoutes = require('./server/apiRoutes.js')
const port = process.env.PORT || 8000
const functions = require('./server/functions.js')

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(join(__dirname, 'public')))

app.use('*', (req, res, next) => {
	// Logger
	let time = new Date()
	console.log(
		`${req.method} to ${
			req.originalUrl
		} at ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`
	)
	next()
})

app.use('/api', apiRoutes)
app.get('/', (req, res) => {
	res.render(join(__dirname, 'server/views/index'), {
		snapshots: ['example.png'],
	})
})

app.listen(port, '0.0.0.0', async () => {
	console.log(`> Server started on localhost:${port}`)
	try {
		await functions.deleteExistingSnapshots()
	} catch (e) {
		console.log('Error deleting snapshots:', e)
		process.exit(1)
	}

	try {
		await functions.generateAllSnapshots()
	} catch (e) {
		console.log('Error generating snapshots:', e)
		process.exit(1)
	}
})
