// routes all http requests

// TODO: use mongoDB atlas for file storage

const express = require('express');
const router = express.Router();
const { join: joinPath } = require("path");
const { existsSync } = require("fs");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

require('dotenv').config();


// tokens

const SESSION_SECRET = process.env.SESSION_SECRET;
if (SESSION_SECRET == undefined) throw new Error("No session secret set");

const cookieOptions = {
	signed: true,
	HttpOnly: true,
	maxAge: 1000 * 60 * 60 * 24 * 3 // 3 days -> ms
};

function createAuthToken(data, res) {
	res.cookie("authToken", data, cookieOptions);
}

function getAuthData(req) {
	return req.signedCookies.authToken;
}


// middleware

router.use(cookieParser(SESSION_SECRET)); // signed auth tokens

// for parsing post requests
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const redirectToLogin = (req, res, next) => {
	if (!getAuthData(req)) {
		res.redirect("/login");
	} else {
		next();
	}
};

const redirectToHome = (req, res, next) => {
	if (getAuthData(req)) {
		res.redirect("/home");
	} else {
		next();
	}
};




// routing

const __publicDirname = joinPath(__dirname, "..", "public");


router.get('/', redirectToHome, (req, res) => {
	res.sendFile(joinPath(__publicDirname, "landing", "index.html"));
});

router.get('/login', redirectToHome, (req, res) => {
	res.sendFile(joinPath(__publicDirname, "login", "index.html"));
});

router.get('/register', redirectToHome, (req, res) => {
	res.sendFile(joinPath(__publicDirname, "register", "index.html"));
});


router.get('/home', redirectToLogin, (req, res) => {
	res.sendFile(joinPath(__publicDirname, "home", "index.html"));
});




// Login route
router.post('/login', (req, res) => {
	const { username, password } = req.body;
	if (username !== 'user' || password !== 'password') {
		return res.redirect('/login?error=Invalid%20credentials');
	}

	// Create auth token and set as cookie
	createAuthToken({ username }, res);
	res.redirect('/home');
});


// Logout route
router.post('/logout', (req, res) => {
	res.clearCookie('authToken');
	res.redirect('/');
});


// register route
router.post('/register', (req, res) => {
	const { username, password } = req.body;
	if (!validateSignupData(username, password)) {
		return res.redirect('/register?error=Invalid%20input');
	}

	createAuthToken({ username }, res);
	res.cookie('username', username, { maxAge: 1000 * 60 * 60 * 24 * 3 }); // 3 days
	res.redirect('/home');
});

function validateSignupData(username, password) {
	if (!username) return false;
	if (username.length < 7) return false;
	if (!password) return false;
	if (password.length < 6) return false;

	return true;
}


// serve static files from public directory
router.use(function (req, res) {
	if (existsSync(__publicDirname + req.url)) {
		// send file if path exists
		if (req.url.endsWith(".html")) { // if request ends with ".html", redirect to path without ".html"
			//return res.redirect(req.url.slice(0, -5));
		}

		res.sendFile(__publicDirname + req.url);
	} else {
		// otherwise send 404
		res.status(404).sendFile(__publicDirname + "/404.html");
	}
});


// export the router
module.exports = router;