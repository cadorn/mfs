
const ASSERT = require('assert');
const PATH = require('path');
const MFS = require('./mfs');


describe('mfs', function () {

	it('should track file access (sync)', function () {
		var fs = new MFS.FileFS({
			lineinfo: true
		});

		let usedPathFired = false;
		fs.once("used-path", function (path, method, meta) {
			ASSERT.equal(method, "existsSync");
			ASSERT.equal(path, __dirname);
			ASSERT.deepEqual(meta, {
				file: __filename,
				line: 24
			});
			usedPathFired = true;
		});
		const exists = fs.existsSync(__dirname);
		ASSERT.equal(exists, true);
		ASSERT.equal(usedPathFired, true);
		
		usedPathFired = false;
		fs.once("used-path", function (path, method, meta) {
			ASSERT.equal(method, "statSync");
			ASSERT.equal(path, __filename);
			ASSERT.deepEqual(meta, {
				file: __filename,
				line: 38
			});
			usedPathFired = true;
		});
		const stat = fs.statSync(__filename);
		ASSERT.equal(typeof stat, 'object');
		ASSERT.equal(typeof stat.size, 'number');
		ASSERT.equal(usedPathFired, true);
	});

	it('should track file access (callback)', function (done) {
		var fs = new MFS.FileFS({
			lineinfo: true
		});

		let usedPathFired = false;
		fs.once("used-path", function (path, method, meta) {
			ASSERT.equal(method, "exists");
			ASSERT.equal(path, __dirname);
			ASSERT.deepEqual(meta, {
				file: __filename,
				line: 59
			});
			usedPathFired = true;
		});
		fs.exists(__dirname, function (exists) {
			ASSERT.equal(exists, true);
			ASSERT.equal(usedPathFired, true);

			usedPathFired = false;
			fs.once("used-path", function (path, method, meta) {
				ASSERT.equal(method, "stat");
				ASSERT.equal(path, __filename);
				ASSERT.deepEqual(meta, {
					file: __filename,
					line: 73
				});
				usedPathFired = true;
			});
			fs.stat(__filename, function (err, stat) {
				ASSERT.equal(err, null);
				ASSERT.equal(typeof stat, 'object');
				ASSERT.equal(typeof stat.size, 'number');
				ASSERT.equal(usedPathFired, true);
				done(null);
			});
		});
	});

	it('should track file access (async)', async function () {
		var fs = new MFS.FileFS({
			lineinfo: true
		});

		let usedPathFired = false;
		fs.once("used-path", function (path, method, meta) {
			ASSERT.equal(method, "exists");
			ASSERT.equal(path, __dirname);
			ASSERT.deepEqual(meta, {
				file: __filename,
				line: 98
			});
			usedPathFired = true;
		});
		const exists = await fs.exists(__dirname);
		ASSERT.equal(exists, true);
		ASSERT.equal(usedPathFired, true);
		
		usedPathFired = false;
		fs.once("used-path", function (path, method, meta) {
			ASSERT.equal(method, "stat");
			ASSERT.equal(path, __filename);
			ASSERT.deepEqual(meta, {
				file: __filename,
				line: 112
			});
			usedPathFired = true;
		});
		const stat = await fs.stat(__filename);
		ASSERT.equal(typeof stat, 'object');
		ASSERT.equal(typeof stat.size, 'number');
		ASSERT.equal(usedPathFired, true);
	});

});
