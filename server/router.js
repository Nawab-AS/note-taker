// routes all http requests

// TODO: use mongoDB atlas for file storage

const express = require('express');
const router = express.Router();
const { join: joinPath } = require("path");
const { existsSync } = require("fs");

const __publicDirname = joinPath(__dirname, "..", "public");


router.get('/', (req, res) => {
	res.sendFile(joinPath(__publicDirname, "index", "index.html"));
});


// serve static files from public directory
router.use(function (req, res) {
	if (existsSync(__publicDirname + req.url)) {
		// send file if path exists
		if (req.url.endsWith(".html")) { // if request ends with ".html", redirect to path without ".html"
			return res.redirect(req.url.slice(0, -5));
		}

		res.sendFile(__publicDirname + req.url);
	} else {
		// otherwise send 404
		res.status(404).sendFile(__publicDirname + "/404.html");
	}
});


// export the router
module.exports = router;