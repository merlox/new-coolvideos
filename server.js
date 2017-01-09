var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express(),
	apiRoutes = require('./server/apiRoutes.js'),
	port = (process.env.PORT || 9000),
	functions = require('./server/functions.js'),
	fs = require('fs'),
	http = require('http');

//var options = {
//	key: fs.readFileSync('/etc/letsencrypt/live/thetoptenweb.com/privkey.pem'),
//	cert: fs.readFileSync('/etc/letsencrypt/live/thetoptenweb.com/cert.pem')
//};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', (req, res, next) => {
	console.log(`Req: ${req.originalUrl} from ${req.ip}`);
});

app.use('/api', apiRoutes);

/*

PUBLIC ROUTES HERE

*/
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/start.html'));
});

app.listen(port, (req, res) => {
	console.log('Server started');
	functions.deleteExistingSnapshots(err => {
	    if(err) console.log(err);
	    functions.generateAllSnapshots((err) => {
	        if(err) console.log(err);
	    });
	});
});
