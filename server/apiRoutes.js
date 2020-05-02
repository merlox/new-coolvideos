const express = require('express')
const api = express.Router()
const functions = require('./functions.js')

api.get('/get-all-videos', async (req, res) => {
	try {
		const snapshotTitles = await functions.getAllSnapshots()
		res.json({
			ok: true,
			msg: 'Snapshots obtained successfully',
			snapshotTitles,
		})
	} catch (e) {
		res.json({
			ok: false,
			msg: 'Error getting the snapshot titles',
			err: e,
		})
	}
})

api.get('/video/:videoName', async (req, res) => {
	try {
		await functions.getVideo(req.params.videoName)
		res.json({
			ok: true,
			msg: 'Video obtained successfully',
		})
	} catch (e) {
		res.json({
			ok: false,
			msg: 'Error getting the video',
			err: e,
		})
	}
})

module.exports = api
