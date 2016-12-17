let express = require('express'),
	path = require('path'),
	api = express.Router(),
	functions = require('./functions.js');

api.get('/get-all-videos', (req, res) => {
	functions.getAllSnapshots((snapshotTitles) => {
		res.send(snapshotTitles);
	});
});
api.post('/upload-videos', (req, res) => {
	functions.saveOnlineVideos(req.body.data, (err) => {
		if(err) console.log(err);
		else res.send(null);
	});
});

module.exports = api;