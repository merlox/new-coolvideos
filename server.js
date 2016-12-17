var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express(),
	apiRoutes = require('./server/apiRoutes.js'),
	port = (process.env.PORT || 8080),
	functions = require('./server/functions.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(port, () => {
	console.log('Server started');
	functions.generateAllOnlineSnapshots((err) => {
		if(err) console.log(err);
	});
});
