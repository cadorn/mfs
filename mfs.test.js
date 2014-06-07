
const ASSERT = require("assert");
const PATH = require("path");
const MFS = require("./mfs");


describe('mfs', function() {

	it('should track file access', function(done) {
		var fs = new MFS.FileFS({
			lineinfo: true
		});
		fs.on("used-path", function(path, method, meta) {
			ASSERT.equal(method, "existsSync");
			ASSERT.equal(path, __dirname);
			ASSERT.deepEqual(meta, {
				file: '/genesis/github.com~cadorn/mfs/mfs.test.js',
				line: 22
			});
			return done(null);
		});
		fs.existsSync(__dirname);
	});

});
