const express = require('express')
const bodyParser = require('body-parser')
const { join } = require('path')
const app = express()
const port = process.env.PORT || 8000
const Storage = require('node-storage')
const functions = require('./server/functions.js')
const store = new Storage(join(__dirname, 'storage'))

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

app.get('/', (req, res) => {
	res.render(join(__dirname, 'server/views/index'), {
		snapshots: store.get('snapshots'),
	})
})

app.get('/pictures', (req, res) => {
	res.render(join(__dirname, 'server/views/pictures'), {
		pictures: store.get('pictures')
	})
})

app.listen(port, '0.0.0.0', async () => {
	console.log(`> Server started on localhost:${port}`)

	// Reset snapshots
	store.put('snapshots', [])
	store.put('pictures', [])

	try {
		await functions.generateInitialFolders()
	} catch (e) {
		console.log('Error generating initial folders:', e)
		process.exit(1)
	}

	try {
		const pictures = await functions.getPictures()
		store.put('pictures', pictures)
	} catch (e) {
		console.log('Error getting pictures:', e)
		process.exit(1)
	}

	try {
		await functions.deleteExistingSnapshots()
	} catch (e) {
		console.log('Error deleting snapshots:', e)
		process.exit(1)
	}

	try {
		const snapshots = await functions.generateAllSnapshots()
		store.put('snapshots', snapshots)
	} catch (e) {
		console.log('Error generating snapshots:', e)
		process.exit(1)
	}
})
