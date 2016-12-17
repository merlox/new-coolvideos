let fs = require('fs'),
	cp = require('child_process'),
	path = require('path'),
    Mongo = require('mongodb').MongoClient,
    MongoUrl = 'mongodb://merunas:jakx1234.@ds119508.mlab.com:19508/merunas-mongo',
    db = null;

function connectDatabase(cb){
	Mongo.connect(MongoUrl, (err, database) => {
		if(err) return cb(err);
		db = database;
		return cb(null);
	}); //Cierre de la conexion a la db
};
//Origin es el archivo con path y end es solo directorio sin nombre de archivo
function copyFile(origin, end, fileName, callback){
	console.log('CopyFile, functions.js');
	let callbackCalled = false;
	let readStream = fs.createReadStream(origin);
	readStream.on('error', (err) => {
		console.log(err);
		done(err);
	});
	let finalName = path.join(end, fileName);
	let writeStream = fs.createWriteStream(finalName);
	writeStream.on('error', (err) => {
		console.log(err);
		done(err);
	});
	writeStream.on('close', (ex) => {
		done();
	});
	readStream.pipe(writeStream);

	function done(err){
		if(!callbackCalled){
			return callback(err);
			callbackCalled = true;
		}
	}
};
//To generate a snapshot given the video name at the 1:35 time
function generateSnapshot(file, cb){
	let pathToFile = path.join(__dirname, '/uploads/videos/', file);
	let snapshotFilename = file.replace(/(\.mp4)+/, '.jpg');
    let pathToSnapshot = path.join(__dirname, '/uploads/snapshots/', snapshotFilename);

    fs.stat(path.join(__dirname, '/uploads/snapshots/'), (err, stats) => {
    	if(err) if(err.code == 'ENOENT') fs.mkdir(path.join(__dirname, '/uploads/snapshots/'), (err) => {
    		if(err) console.log(err);
    	});
    });

	let ffmpeg = cp.spawn('ffmpeg', ['-y', '-ss', '00:01:35', '-i', pathToFile, '-vframes', '1', pathToSnapshot]);

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
//To generate the snapshots for all videos
function generateAllSnapshots(){
	let videosLocation = path.join(__dirname, 'uploads/videos');
	fs.readdir(videosLocation, (err, videos) => {
		if(err) console.log('Could not read videos folder: '+err);
		videos.forEach((video) => {
			generateSnapshot(video, (err) => {
				if(err) console.log(err);
			});
		});
	});
};
//To return the snapshots of all videos as an array callback not generate images
function getAllSnapshots(cb){
	if(cb == null){
		cb = () => {};
	}
	let snapshotsLocation = path.join(__dirname, 'uploads/snapshots');
	let snapshots = [];
	fs.readdir(snapshotsLocation, (err, images) => {
		images.forEach((image, index) => {
			snapshots.push(image);
			let origin = path.join(__dirname, '/uploads/snapshots/', image);
			let end = path.join(__dirname, '../public/public-uploads/');
			functions.copyFile(origin, end, image, (err) => {
				if(err) console.log(err);
			});
			if(index + 1 >= images.length){
				return cb(snapshots);
			}
		});
	});
};
//To generate snapshots of online videos
function getOnlineSnapshot(url, cb){
	let videoName = url;
	let snapshotName = videoName.substring(45).replace(/(\.mp4)+/, '.jpg');
	let snapshotPathAndName = path.join(__dirname, '/uploads/snapshots/', snapshotName);
	cp.exec('ffmpeg -y -ss 00:01:35 -i '+videoName+' -vframes 1 '+snapshotPathAndName, (err, stdout, stderr) => {
		console.log('done');
		if(err){
			return cb(err);
		}else{
			return cb(null);
		}
	});
};
//To generate all the online videos snapshots
function generateAllOnlineSnapshots(cb){
	db.collection('cool-videos').find({}).toArray((err, videos) => {
		if(err) return cb(err);
		let error = "";
		fs.readFile(path.join(__dirname, 'videonames.txt'), (err, data) => {
			if(err) return cb(err);
			let videoNames = data.toString();
			let re = /(http:\/\/.*\.mp4)/gm;
			let videoNamesArray = [];
			let finalVideoNamesArray = [];
			//Cada vez que se ejecuta el regex sale el e mantensiguiente resultado y se almacena siempre en el array[0]
			//con lo que hay que crear un nuevo array quga esos resultados
			while((videoNamesArray = re.exec(videoNames)) != null){
				finalVideoNamesArray.push(videoNamesArray[0]);
			}
			finalVideoNamesArray.forEach((video, index) => {
				getOnlineSnapshot(video, (err) => {
					if(err) error = err;
				});
				if(index + 1 >= videos.length){
					if(error) return cb(error);
					else return cb(null);
				}
			});
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
	copyFile: copyFile,
	generateSnapshot: generateSnapshot,
	generateAllSnapshots: generateAllSnapshots,
	getAllSnapshots: getAllSnapshots,
	connectDatabase: connectDatabase,
	generateAllOnlineSnapshots: generateAllOnlineSnapshots,
	getOnlineSnapshot: getOnlineSnapshot,
	saveOnlineVideos: saveOnlineVideos
};