mfs
===

Monitor your calls to [node-fs-extra](https://github.com/jprichardson/node-fs-extra).

Install
-------

	npm install mfs

Usage
-----

	const MFS = require("mfs");
	const FS = new MFS.FileFS();

	if (process.env.DEBUG) {
		FS.on("used-path", function(path, method) {
			console.log("FS." + method, path);
		});
	}

	FS.existsSync(__dirname);


License
-------

Licensed under MIT

Copyright (c) 2013-2014 Christoph Dorn
