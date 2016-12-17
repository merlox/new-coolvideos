var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express(),
	apiRoutes = require('./server/apiRoutes.js'),
	functions = require('./server/functions.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.get('/admin-upload-merlox', (req, res) => {
	res.sendFile(path.join(__dirname, '/server/admin/uploadAdmin.html'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

// app.listen('8000', '0.0.0.0', () => {
// 	console.log('Server started');
// 	functions.generateAllSnapshots();
// });

app.listen('8080', '0.0.0.0', () => {
	console.log('Server started');
	functions.generateAllOnlineSnapshots((err) => {
		if(err) console.log(err);
	});
});
