const fs = require('fs')
const cp = require('child_process')
const { join } = require('path')

// Origin es el archivo con path y end es solo directorio sin nombre de archivo
function copyFile(origin, end, fileName) {
	console.log('copyFile')
	return new Promise((resolve, reject) => {
		const finalName = join(end, fileName)
		const readStream = fs.createReadStream(origin)
		const writeStream = fs.createWriteStream(finalName)
		readStream.on('error', (err) => {
			reject(err)
		})
		writeStream.on('error', (err) => {
			reject(err)
		})
		writeStream.on('close', () => {
			resolve()
		})
		readStream.pipe(writeStream)
	})
}

// To return the snapshots of all videos as an array callback not generate images
function getAllSnapshots() {
	console.log('getAllSnapshots')
	const snapshotsLocation = join(__dirname, 'uploads/snapshots')
	const snapshots = []
	return new Promise((resolve, reject) => {
		fs.readdir(snapshotsLocation, (err, images) => {
			if (err) return reject(err)
			images.forEach(async (image, index) => {
				snapshots.push(image)
				const origin = join(__dirname, '/uploads/snapshots/', image)
				const end = join(__dirname, '../public/public-uploads/')
				try {
					await copyFile(origin, end, image)
				} catch (e) {
					return reject(e)
				}
				if (index + 1 >= images.length) {
					return resolve(snapshots)
				}
			})
		})
	})
}

// To generate snapshots of online videos
function getOnlineSnapshot(url) {
	console.log('getOnlineSnapshot')
	const videoName = url
	const snapshotName = videoName.substring(45).replace(/(\.mp4)+/, '.jpg')
	const snapshotPathAndName = join(
		__dirname,
		'/uploads/snapshots/',
		snapshotName
	)
	return new Promise((resolve, reject) => {
		cp.exec(`ffmpeg -y -ss 00:01:35 -i ${videoName} -vFrames 1 ${snapshotPathAndName}`,
			(err, stdout, stderr) => {
				if (err) return reject(err)
				if (stderr) return reject(err)
				resolve(stdout)
			}
		)
	})
}

// Generate snapshot image
function generateSnapshot(videoName) {
	console.log('generateSnapshot')
	const snapshotName = videoName.replace(/(\.mp4)+/, '.jpg')
	const videoPathAndName = join(__dirname, '/uploads/videos', videoName)
	const snapshotPathAndName = join(
		__dirname,
		'/uploads/snapshots',
		snapshotName
	)
	return new Promise((resolve, reject) => {
		cp.exec(`ffmpeg -y -ss 00:01:35 -i ${videoPathAndName} -vFrames 1 ${snapshotPathAndName}`,
			(err, stdout, stderr) => {
				if (err) return reject(err)
				if (stderr) return reject(err)
				resolve(stdout)
			}
		)
	})
}

// To generate the snapshots only
function generateAllSnapshots() {
	console.log('generateAllSnapshots')
	const videosLocation = join(__dirname, 'uploads/videos')
	return new Promise((resolve, reject) => {
		fs.readdir(videosLocation, (err, videos) => {
			if (err) return reject(err)
			videos.map(async video => {
				try {
					await generateSnapshot(video)
				} catch (e) {
					return reject(e)
				}
			})
			return resolve()
		})
	})
}

// To delete existing snaptshots
function deleteExistingSnapshots() {
	console.log('deleteExistingSnapshots')
	let counter = 0
	return new Promise((resolve, reject) => {
		fs.readdir(join(__dirname, 'uploads/snapshots'), (err, files) => {
			if (err) return reject(err)
			if (
				!files ||
				files === [] ||
				files.length === 0
			) {
				return reject('No files found in snapshots')
			}
			files.map(file => {
				fs.unlink(join(__dirname, 'upload/snapshots', file), err => {
					if (err) return reject(err)
					counter++
					if (counter >= files.length) {
						return resolve()
					}
				})
			})
		})
	})
}
// To generate all the online videos snapshots
function generateAllOnlineSnapshots() {
	console.log('generateAllOnlineSnapshots')

	return new Promise((resolve, reject) => {
		fs.readFile(join(__dirname, 'videonames.txt'), (err, data) => {
			if (err) return reject(err)
			const videoNames = data.toString()
			const re = /(http:\/\/.*\.mp4)/gm
			const videoNamesArray = []
			const finalVideoNamesArray = []
			// Cada vez que se ejecuta el regex sale el se mantiene el siguiente resultado 
			// y se almacena siempre en el array[0] con lo que hay que crear un nuevo array 
			// que tenga esos resultados
			while ((videoNamesArray = re.exec(videoNames)) != null) {
				finalVideoNamesArray.push(videoNamesArray[0])
			}
			finalVideoNamesArray.map(async (video, index) => {
				try {
					await getOnlineSnapshot(video)
					if (index + 1 >= finalVideoNamesArray.length) {
						return resolve()
					}
				} catch (e) {
					return reject(e)
				}
			})
		})
	})
}
// Para copiar un video y retornar nada
async function getVideo(videoName) {
	console.log('GetVideo')
	const videoPathAndName = join(__dirname, 'uploads/videos', videoName)
	const end = join(__dirname, '../public/public-uploads/')
	try {
		return await copyFile(videoPathAndName, end, videoName)
	} catch (e) {
		return e
	}
}

module.exports = {
	copyFile: copyFile,
	getAllSnapshots: getAllSnapshots,
	generateAllOnlineSnapshots: generateAllOnlineSnapshots,
	getOnlineSnapshot: getOnlineSnapshot,
	deleteExistingSnapshots: deleteExistingSnapshots,
	generateAllSnapshots: generateAllSnapshots,
	getVideo: getVideo,
}
