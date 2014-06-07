
const PATH = require("path");
const UTIL = require("util");
const URL = require("url");
const FS = require("fs-extra");
const EVENTS = require("events");
const STACK_TRACE = require("stack-trace");


exports.READ_METHODS = {
	"exists": true,
	"existsSync": true,
	"readFile": true,
	"readFileSync": true,
	"openSync": true,
	"readdir": true,
	"readdirSync": true,
	"lstat": true,
	"stat": true,
	"lstatSync": true,
	"statSync": true,
	"readlink": true,
	"readlinkSync": true,
	"createReadStream": true,
	"createWriteStream": true,
	"readJsonFile": true,
	"readJSONFile": true,
	"readJsonFileSync": true,
	"readJSONFileSync": true,
	"readJson": true,
	"readJSON": true,
	"readJsonSync": true,
	"readJSONSync": true,
	"open-read": true,
	"fstat": true,
	"read": true
};

exports.WRITE_METHODS = {
	"truncate": true,
	"truncateSync": true,
	"rmdir": true,
	"rmdirSync": true,
	"mkdir": true,
	"mkdirSync": true,
	"symlink": true,
	"symlinkSync": true,
	"unlink": true,
	"unlinkSync": true,
	"lchmod": true,
	"lchmodSync": true,
	"chmod": true,
	"chmodSync": true,
	"lchown": true,
	"lchownSync": true,
	"chown": true,
	"chownSync": true,
	"utimes": true,
	"utimesSync": true,
	"writeFile": true,
	"writeFileSync": true,
	"appendFile": true,
	"appendFileSync": true,
	"remove": true,
	"removeSync": true,
	"delete": true,
	"deleteSync": true,
	"createFile": true,
	"createFileSync": true,
	"outputFile": true,
	"outputFileSync": true,
	"outputJsonSync": true,
	"outputJSONSync": true,
	"outputJson": true,
	"outputJSON": true,
	"writeJsonFile": true,
	"writeJSONFile": true,
	"writeJsonFileSync": true,
	"writeJSONFileSync": true,
	"writeJson": true,
	"writeJSON": true,
	"writeJsonSync": true,
	"writeJSONSync": true,
	"open-write": true,
	"ftruncate": true,
	"write": true,
	"outputFileAtomic": true
};

var FileFS = exports.FileFS = function(options) {
	var self = this;
	self._options = options;
	self.READ_METHODS = exports.READ_METHODS;
	self.WRITE_METHODS = exports.WRITE_METHODS;
}

UTIL.inherits(FileFS, EVENTS.EventEmitter);


FileFS.prototype.notifyUsedPath = function(path, method, meta) {
	this.emit("used-path", path, method, meta);
/*
	if (exports.READ_METHODS[method]) {
		console.log(("[pinf-for-nodejs][vfs] use READ method '" + method + "' for: " + path).magenta);
	} else
	if (exports.WRITE_METHODS[method]) {
		console.log(("[pinf-for-nodejs][vfs] use WRITE method '" + method + "' for: " + path).magenta);
	} else {
		console.log(("[pinf-for-nodejs][vfs] use method '" + method + "' for: " + path).magenta);
	}
*/
}

FS.outputFileAtomic = function(path, data, callback) {
	var tmpPath = path + "~" + Date.now();
    return FS.outputFile(tmpPath, data, function(err) {
    	if (err) return callback(err);
    	// Assume file exists.
    	return FS.unlink(path, function() {
    		// We ignore error.
    		return FS.rename(tmpPath, path, callback);
    	});
    });
}

// Intercept all FS methods that have a path like argument.
Object.keys(FS).forEach(function(name) {
	var source = null;
	var args = null;
	var index = -1;
	if (name === "open") {
		FileFS.prototype[name] = function() {
			var mode = "write";
			if (arguments[1] === "r" || arguments[1] === "rs") {
				mode = "read";
			}
			var meta = {};
			if (this._options.lineinfo) {
				var trace = STACK_TRACE.get();
			}
			this.notifyUsedPath(arguments[0], name + "-" + mode, meta);
			return FS[name].apply(null, arguments);
		};
	} else
	if (
		typeof FS[name] === "function" &&
		/^[a-z]/.test(name) &&
		(source = FS[name].toString()) &&
		(args = source.match(/function[^\(]+\(([^\)]*)\)/)[1].split(", ")) &&
		(
			(index = args.indexOf("path")) >= 0 ||
			(index = args.indexOf("dir")) >= 0 ||
			(index = args.indexOf("file")) >= 0 ||
			(index = args.indexOf("filename")) >= 0
		)
	) {
		FileFS.prototype[name] = function() {
			var meta = {};
			if (this._options.lineinfo) {
				var trace = STACK_TRACE.get();
				meta.file = trace[1].getFileName();
				meta.line = trace[1].getLineNumber();
			}
			this.notifyUsedPath(arguments[index], name, meta);
			var cb = arguments[arguments.length-1];
			if (typeof cb === "function" && name !== "exists") {
				arguments[arguments.length-1] = function(err) {
					if (err) {
						//console.error("[pinf-vfs-js] ERROR: While calling '" + name + "' for '" + arguments[index] + "'", err);
					}
					return cb.apply(null, arguments);
				}
			}
			try {
				return FS[name].apply(null, arguments);
			} catch(err) {
				//console.error("[pinf-vfs-js] ERROR: While calling '" + name + "' for '" + arguments[index] + "'", err);
				throw err;
			}
		};
	} else {
		FileFS.prototype[name] = FS[name];
	}
});

