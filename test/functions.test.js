const expect = require('chai').expect
const fs = require('fs')
const { join } = require('path')
const functions = require('../server/functions')
const testFileFolder = 'files'
const secondaryTestFolder = 'test'

describe('Functions unit tests', () => {
	beforeEach(async () => {
		try {
			fs.statSync(join(__dirname, testFileFolder))
		} catch (e) {
			fs.mkdirSync(join(__dirname, testFileFolder))
		}
	})
	afterEach(async () => {
		// Remove all the created files
		deleteFolderRecursive(join(__dirname, testFileFolder))
	})
	describe('copyFile', () => {
		it('should copy a file successfully', async () => {
			const fileName = 'test-file'
			const path = join(__dirname, testFileFolder, fileName)
            const end = join(__dirname, testFileFolder, secondaryTestFolder)
            const contents = 'This is some sample data'
			// Create a file
			try {
				await fs.writeFileSync(path, contents, 'utf-8')
			} catch (e) {
				expect(e).to.be.null
			}

			try {
				await fs.mkdirSync(end)
				await functions.copyFile(path, end, fileName)
			} catch (e) {
				expect(e).to.be.null
			}

			try {
				const file = fs.statSync(join(__dirname, testFileFolder))
				expect(file).to.not.be.null
				const _contents = fs.readFileSync(
					join(__dirname, testFileFolder, fileName),
					'utf-8'
                )
                expect(_contents).to.eq(contents)
			} catch (e) {
				expect(e).to.be.null
			}
		})
	})

	describe()
})

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
