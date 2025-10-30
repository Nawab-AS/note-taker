const express = require('express');
const router = express.Router();
const { join: joinPath } = require("path");
const { existsSync } = require("fs");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { registerUser, validateLogin, getUserData } = require('./database');

require('dotenv').config();


// tokens
const SESSION_SECRET = process.env.SESSION_SECRET;
if (SESSION_SECRET == undefined) throw new Error("No session secret set");

const cookieOptions = {
	httpOnly: true,
	maxAge: 1000 * 60 * 60 * 24 * 3 // 3 days -> ms
};

function createAuthToken(data, res) {
	const token = jwt.sign(data, SESSION_SECRET, { expiresIn: '3d' });
	res.cookie('authToken', token, cookieOptions);
}

function getAuthData(req) {
	const token = req.cookies && req.cookies.authToken;
	if (!token) return null;

	try {
		return jwt.verify(token, SESSION_SECRET);
	} catch (err) {
		return null;
	}
}


// middleware

router.use(cookieParser());
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


router.get('/home', redirectToLogin, async (req, res) => {
	const username = getAuthData(req).username;
	const data = JSON.stringify(await getUserData(username));
	res.render('home/index', { data });
});




// Login route
router.post('/login', async (req, res) => {
	const { username, password } = req.body;

	try {
		if (!(await validateLogin(username, password))) {
			return res.redirect('/login?error=Invalid%20credentials');
		}

		// Create auth token and set as cookie
		createAuthToken({ username }, res);
		res.redirect('/home');
	} catch (error) {
		console.error('Error during login:', error.message);
		res.redirect('/login?error=Server%20error');
	}
});


// Logout route
router.post('/logout', (req, res) => {
	res.clearCookie('authToken');
	res.redirect('/');
});

router.post('/isValid', (req, res) => {
	const { username, password } = req.body;
	res.json(validateSignupData(username.trim(), password.trim()));
});

// register route
router.post('/register', async (req, res) => {
	let { username, password } = req.body;
	username = username.trim();
	password = password.trim();

	if (!validateSignupData(username, password).valid) {
		return res.redirect('/register?error=Invalid%20input');
	}

	try {
		await registerUser(username, password);
		createAuthToken({ username }, res);
		res.cookie('username', username, { maxAge: 1000 * 60 * 60 * 24 * 3 }); // 3 days
		res.redirect('/home');
	} catch (error) {
		if (error.message === 'Username already exists') {
			return res.redirect('/register?error=Username%20already%20exists');
		}
		console.error('Error during registration:', error);
		res.redirect('/register?error=Internal%20server%20error');
	}
});

function validateSignupData(username, password) {
	// username
	if (!username || typeof username != "string") return { valid: false, reason: "Enter a username" };
    if (username.length < 7) return {valid: false, reason: "Username must be at least 7 characters long"};
    if (username.length > 20) return {valid: false, reason: "Username must be less than 20 characters long"};
    if (!/^[a-z0-9_-]+$/.test(username)) return {valid: false, reason: "Username can only contain lowercase letters, numbers, underscores and hyphens"}
    if (username.includes("admin") || username.includes("administrator")) return {valid: false, reason: "Username is not allowed"};

    // password
    if (!password || typeof password != "string") return { valid: false, reason: "Enter a password" };
    if (password.length < 7) return {valid: false, reason: "Password must be at least 7 characters long"};
    if (password.length > 20) return {valid: false, reason: "Password must be less than 20 characters long"};
    if (!/^[a-zA-Z0-9_]+$/.test(password)) return {valid: false, reason: "Password can only contain lowercase letters, numbers and underscores"};
    if (password == username) return {valid: false, reason: "Password cannot be the same as username"};


    return {valid: true, reason: ""};
}


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


function setupEJS(app) {
	app.set('view engine', 'ejs');
	app.set('views', __publicDirname);
}

// export the router
module.exports = { router, setupEJS };