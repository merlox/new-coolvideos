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
//To return the snapshots of all videos as an array callback not generate images
function getAllSnapshots(cb){
    console.log('getAllSnapshots');
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
    console.log('getOnlineSnapshot');
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

//Generate snapshot image
function generateSnapshot(videoName, cb){
    console.log('generateSnapshot');
        var snapshotName = videoName.replace(/(\.mp4)+/, '.jpg');
        var videoPathAndName = path.join(__dirname, '/uploads/videos', videoName);
        var snapshotPathAndName = path.join(__dirname, '/uploads/snapshots', snapshotName);
        cp.exec(`ffmpeg -y -ss 00:01:35 -i ${videoPathAndName} -vframes 1 ${snapshotPathAndName}`, (err, stdout, stderr) => {
                console.log('done');
                if(err) return cb('Could not generate snapshot');
                return cb(null);
        });
};
//To generate the snapshots only
function generateAllSnapshots(cb){
    console.log('generateAllSnapshots');
        if(cb == null) cb = () => {};
        var videosLocation = path.join(__dirname, 'uploads/videos');
        fs.readdir(videosLocation, (err, videos) => {
            if(err) return cb(err);
            let counter = 0;
            videos.forEach(video => {
                generateSnapshot(video, (err) => {
                        if(err) console.log('Could not generate snapshot.');
                        counter++;
                        if(counter >= videos.length){
                        	return cb(null);
                        }
                });
            });
        });
};
function deleteExistingSnapshots(cb){
    console.log('deleteExistingSnapshots');
    fs.readdir(path.join(__dirname, 'uploads/snapshots'), (err, files) => {
            if(err) return console.log(err);
            if(files == [] || files === null || files === undefined || files.length == 0){
                return cb('No files found in snapshots');
            }
            var counter = 0;
            files.forEach(file => {
                    fs.unlink(path.join(__dirname, 'upload/snapshots', file), (err) => {
                            if(err) console.log(err);
                            counter++;
                            if(counter >= files.length){
                                    return cb(null);
                            }
                    });
            });
    });
};
//To generate all the online videos snapshots
function generateAllOnlineSnapshots(cb){
    console.log('generateAllOnlineSnapshots');
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
//Para copiar un video y retornar nada
function getVideo(videoName, cb){
    console.log('GetVideo');
    let videoPathAndName = path.join(__dirname, 'uploads/videos', videoName);
    let end = path.join(__dirname, '../public/public-uploads/');
    copyFile(videoPathAndName, end, videoName, (err) => {
        if(err) return cb('Could not send the video, please try again.');
        return cb(null);
    });
};

module.exports = {
        copyFile: copyFile,
        getAllSnapshots: getAllSnapshots,
        generateAllOnlineSnapshots: generateAllOnlineSnapshots,
        getOnlineSnapshot: getOnlineSnapshot,
        deleteExistingSnapshots: deleteExistingSnapshots,
        generateAllSnapshots: generateAllSnapshots,
        getVideo: getVideo
};
