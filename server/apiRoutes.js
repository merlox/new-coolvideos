var express = require('express'),
	path = require('path'),
	api = express.Router(),
	functions = require('./functions.js');

api.get('/get-all-videos', (req, res) => {
	functions.getAllSnapshots((snapshotTitles) => {
		res.send(snapshotTitles);
	});
});
api.get('/video/:videoName', (req, res) => {
	functions.getVideo(req.params.videoName, (err, video) => {
		if(err) return res.send(err);
		res.send(null);
	});
});
module.exports = api;