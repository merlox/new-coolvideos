var fs = require('fs'),
	cp = require('child_process'),
	path = require('path');
//Origin es el archivo con path y end es solo directorio sin nombre de archivo
function copyFile(origin, end, fileName, callback){
	console.log('CopyFile, functions.js');
	var callbackCalled = false;
	var readStream = fs.createReadStream(origin);
	readStream.on('error', (err) => {
		console.log(err);
		done(err);
	});
	var finalName = path.join(end, fileName);
	var writeStream = fs.createWriteStream(finalName);
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
	var pathToFile = path.join(__dirname, '/uploads/videos/', file);
	var snapshotFilename = file.replace(/(\.mp4)+/, '.jpg');
    var pathToSnapshot = path.join(__dirname, '/uploads/snapshots/', snapshotFilename);

    fs.stat(path.join(__dirname, '/uploads/snapshots/'), (err, stats) => {
    	if(err) if(err.code == 'ENOENT') fs.mkdir(path.join(__dirname, '/uploads/snapshots/'), (err) => {
    		if(err) console.log(err);
    	});
    });

	var ffmpeg = cp.spawn('ffmpeg', ['-y', '-ss', '00:01:35', '-i', pathToFile, '-vframes', '1', pathToSnapshot]);

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
	var videosLocation = path.join(__dirname, 'uploads/videos');
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
	var snapshotsLocation = path.join(__dirname, 'uploads/snapshots');
	var snapshots = [];
	fs.readdir(snapshotsLocation, (err, images) => {
		images.forEach((image, index) => {
			snapshots.push(image);
			var origin = path.join(__dirname, '/uploads/snapshots/', image);
			var end = path.join(__dirname, '../public/public-uploads/');
			copyFile(origin, end, image, (err) => {
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
	var videoName = url;
	var snapshotName = videoName.substring(45).replace(/(\.mp4)+/, '.jpg');
	var snapshotPathAndName = path.join(__dirname, '/uploads/snapshots/', snapshotName);
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
	var error = "";
	fs.readFile(path.join(__dirname, 'videonames.txt'), (err, data) => {
		if(err) return cb(err);
		var videoNames = data.toString();
		var re = /(http:\/\/.*\.mp4)/gm;
		var videoNamesArray = [];
		var finalVideoNamesArray = [];
		//Cada vez que se ejecuta el regex sale el e mantensiguiente resultado y se almacena siempre en el array[0]
		//con lo que hay que crear un nuevo array quga esos resultados
		while((videoNamesArray = re.exec(videoNames)) != null){
			finalVideoNamesArray.push(videoNamesArray[0]);
		}
		finalVideoNamesArray.forEach((video, index) => {
			getOnlineSnapshot(video, (err) => {
				if(err) error = err;
			});
			if(index + 1 >= finalVideoNamesArray.length){
				if(error) return cb(error);
				else return cb(null);
			}
		});
	});
};
//To save the videos data to the db
//function saveOnlineVideos(videosData, cb){
//	//Separamos los videos y luego los creamos bien
//	var videos = videosData.split('.webm');
//	var error = "";
//	videos.forEach((video, index) => {
//		video += '.webm';
//		db.collection('cool-videos').update({
//			'video': video
//		}, {
//			'upsert': true
//		}, (err, result) => {
//			if(err) error = err; 
//		});
//		if(index + 1 >= videos.length){
//			if(error) return cb(error);
//			else return cb(null);
//		}
//	});
//};
module.exports = {
	copyFile: copyFile,
	generateSnapshot: generateSnapshot,
	generateAllSnapshots: generateAllSnapshots,
	getAllSnapshots: getAllSnapshots,
	generateAllOnlineSnapshots: generateAllOnlineSnapshots,
	getOnlineSnapshot: getOnlineSnapshot
};
