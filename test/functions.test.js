const expect = require('chai').expect
const fs = require('fs')
const { join } = require('path')
const functions = require('../server/functions')
const testFileFolder = 'files'
const secondaryTestFolder = 'test'

const deleteFolderRecursive = function (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((file, index) => {
			const curPath = join(path, file)
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath)
			} else {
				// delete file
				fs.unlinkSync(curPath)
			}
		})
		fs.rmdirSync(path)
	}
}
