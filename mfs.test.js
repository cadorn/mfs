
const ASSERT = require("assert");
const PATH = require("path");
const MFS = require("./mfs");


describe('mfs', function() {

	it('should track file access', function(done) {
		var fs = new MFS.FileFS();
		fs.on("used-path", function(path, method) {
			ASSERT.equal(method, "existsSync");
			ASSERT.equal(path, __dirname);
			return done(null);
		});
		fs.existsSync(__dirname);
	});

});
