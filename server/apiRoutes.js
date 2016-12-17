var express = require('express'),
	path = require('path'),
	api = express.Router(),
	functions = require('./functions.js');

api.get('/get-all-videos', (req, res) => {
	functions.getAllSnapshots((snapshotTitles) => {
		res.send(snapshotTitles);
	});
});
module.exports = api;
