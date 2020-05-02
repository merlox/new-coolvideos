const cp = require('child_process')
const { join } = require('path')
const { promisifyAll } = require('bluebird')
const fs = promisifyAll(require('fs'))
const snapshotsLocation = join(__dirname, '../public/snapshots')
const videosLocation = join(__dirname, '../public/videos')

// Generate snapshot image
function generateSnapshot(videoName) {
	console.log('generateSnapshot')
	const snapshotName = videoName.replace('.mp4', '.jpg')
	const videoPathAndName = join(videosLocation, videoName)
	const snapshotPathAndName = join(snapshotsLocation, snapshotName)
	return new Promise((resolve, reject) => {
		cp.exec(
			`ffmpeg -y -ss 00:01:35 -i "${videoPathAndName}" -vframes 1 "${snapshotPathAndName}"`,
			(err, stdout, stderr) => {
				if (err) return reject(err)
				resolve(snapshotName)
			}
		)
	})
}

// To generate the snapshots only
// Returns the snapshots generated
function generateAllSnapshots() {
	console.log('generateAllSnapshots')
	let snapshots = []
	return new Promise((resolve, reject) => {
		fs.readdir(videosLocation, (err, videos) => {
			if (err) return reject(err)
			videos.map(async (video, index) => {
				try {
					const snapshot = await generateSnapshot(video)
					snapshots.push(snapshot)
				} catch (e) {
					return reject(e)
				}
				if (index + 1 >= videos.length) {
					return resolve(snapshots)
				}
			})
		})
	})
}

// To delete existing snaptshots
function deleteExistingSnapshots() {
	console.log('deleteExistingSnapshots')
	return new Promise((resolve, reject) => {
		fs.readdir(snapshotsLocation, (err, files) => {
			if (err) return reject(err)
			if (!files || files === [] || files.length === 0) {
				return resolve('No files found in snapshots')
			}
			files.map((file) => {
				fs.unlink(join(snapshotsLocation, file), err => {
					if (err) return reject(err)
				})
			})
			resolve()
		})
	})
}

function generateInitialFolders() {
	console.log('generateInitialFolders')
	return new Promise(async (resolve, reject) => {
		try {
			await fs.statAsync(snapshotsLocation)
		} catch (notFoundError) {
			try {
				await fs.mkdirAsync(snapshotsLocation)
			} catch (e) {
				return reject(e)
			}
		}

		try {
			await fs.statAsync(videosLocation)
		} catch (notFoundError) {
			try {
				await fs.mkdirAsync(videosLocation)
			} catch (e) {
				return reject(e)
			}
		}

		resolve()
	})
}

module.exports = {
	deleteExistingSnapshots,
	generateAllSnapshots,
	generateInitialFolders,
}
