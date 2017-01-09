var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	app = express(),
	apiRoutes = require('./server/apiRoutes.js'),
	port = (process.env.PORT || 9000),
	functions = require('./server/functions.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('*', (req, res, next) => {
	console.log(`Req: ${req.originalUrl} from ${req.ip}`);
	next();
});

app.use('/api', apiRoutes);

app.listen(port, (req, res) => {
	console.log('Server started');
	functions.deleteExistingSnapshots(err => {
	    if(err) console.log(err);
	    functions.generateAllSnapshots((err) => {
	        if(err) console.log(err);
	    });
	});
});
