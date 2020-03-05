mfs
===

Monitor your calls to [node-fs-extra](https://github.com/jprichardson/node-fs-extra) for debug purposes.

Install
-------

	npm install mfs

Usage
-----

	const MFS = require("mfs");
	const FS = new MFS.FileFS({
		lineinfo: true
	});

	if (process.env.DEBUG) {
		FS.on("used-path", function(path, method, meta) {
			console.log("FS." + method, path, meta);
		});
	}

	FS.existsSync(__dirname);


Provenance
----------

Licensed under the **MIT License** by Christoph Dorn since 2013.
