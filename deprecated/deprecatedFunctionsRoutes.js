/*

FUNCTIONS.js

*/
let Mongo = require('mongodb').MongoClient,
    MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
    db = null;

function connectDatabase(cb){
	Mongo.connect(MongoUrl, (err, database) => {
		if(err) return cb(err);
		db = database;
		return cb(null);
	}); //Cierre de la conexion a la db
};
//To generate snapshots of online videos
function getOnlineSnapshot(url, cb){
	let videoName = "http://media.zaspornworld.com/media/videos/webm/68db8821ac3b3c244d6d.webm";
	let snapshotName = videoName.substring(48).replace(/(.webm)+/, '.jpg');
	let snapshotPathAndName = path.join(__dirname, '/uploads/', snapshotName);
	let ffmpeg = cp.spawn('ffmpeg', ['-y', '-ss', '00:01:35', '-i', videoName, '-vframes', '1', snapshotPathAndName]);

	ffmpeg.on('error', (err) => {
		console.log(`Something bad happened: ${err}`);
	});
	ffmpeg.on('exit', (exitCode) => {
		if(exitCode == 0){
			cb(null);
		}else{
			console.log('There was some error creating the snapshot, try again');
			cb('There was some error creating the snapshot, try again');
		}
	});
};
//To generate all the online videos snapshots
function generateAllOnlineSnapshots(cb){
	db.collection('cool-videos').find({}).toArray((err, videos) => {
		if(err) return cb(err);
		let error = "";
		videos.forEach((video, index) => {
			getOnlineSnapshot(video, (err) => {
				if(err) error = err;
			});
			if(index + 1 >= videos.length){
				if(error) return cb(error);
				else return cb(null);
			}
		});
	});
};
//To save the videos data to the db
function saveOnlineVideos(videosData, cb){
	//Separamos los videos y luego los creamos bien
	let videos = videosData.split('.webm');
	let error = "";
	videos.forEach((video, index) => {
		video += '.webm';
		db.collection('cool-videos').update({
			'video': video
		}, {
			'upsert': true
		}, (err, result) => {
			if(err) error = err; 
		});
		if(index + 1 >= videos.length){
			if(error) return cb(error);
			else return cb(null);
		}
	});
};
module.exports = {
	connectDatabase: connectDatabase,
	generateAllOnlineSnapshots: generateAllOnlineSnapshots,
	getOnlineSnapshot: getOnlineSnapshot,
	saveOnlineVideos: saveOnlineVideos
};
/*

APIROUTES.js

*/
api.get('/load-video/:videoName', (req, res) => {
	let videoName = req.params.videoName;
	let origin = path.join(__dirname, '/uploads/videos/', videoName);
	let end = path.join(__dirname, '../public/public-uploads');
	functions.copyFile(origin, end, videoName, (err) => {
		if(err) res.send('Error downloading the video.');
		else res.send(null);
	})
});
api.post('/upload-videos', (req, res) => {
	functions.saveOnlineVideos(req.body.data, (err) => {
		if(err) console.log(err);
		else res.send(null);
	});
});
