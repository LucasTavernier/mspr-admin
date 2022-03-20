const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ActiveDirectory = require("activedirectory");
const rateLimit = require("express-rate-limit");
const sendMail = require("./email");

var config = {
	url: "ldap://mspr-admin.local",
	baseDN: "dc=mspr-admin,dc=local",
};

//On a le droit à 5 requêtes en 1 minute, sinon on est bloqué 1 minute
const limiter = rateLimit({
	max: 10,
	windowMs: 1 * 60 * 1000,
	message: "Trop de requête depuis cette ip",
});

var ad = new ActiveDirectory(config);

const app = express();
const port = 8085;

app.use(
	session({
		secret: "secret",
		resave: true,
		saveUninitialized: true,
		loggedin: false,
	})
);

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.get("/", function (req, res) {
	console.log(req.session);
	if (req.session.loggedin) {
		res.send("CONNECTE");
	} else {
		res.sendFile(path.join(__dirname + "/views/login.html"));
	}
});

app.get("/doubleAuth", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/doubleAuth.html"));
});

app.get("/confirm", (req, res) => {
	res.sendFile(path.join(__dirname + "/views/confirm.html"));
});

app.get("/confirm/:id", (req, res) => {
	let id = req.params.id;

	if (req.session.uuid == id) {
		req.session.loggedin = true;
	}

	res.redirect("/");
});

app.post("/auth", function (req, res) {
	let username = req.body.username;
	let password = req.body.password;

	ad.authenticate(username, password, function (err, auth) {
		if (err) {
			console.log("ERROR: " + JSON.stringify(err));
			res.status(500);
		}
		if (auth) {
			console.log("Connecté !");
			res.status(200);
			res.redirect("/doubleAuth");
		} else {
			console.log("Connexion ratée !");
			res.status(403);
		}
	});
});

app.post("/doubleAuth", function (req, res) {
	let mail = req.body.email;

	sendMail(mail, req.session, function (err, sended) {
		if (err) {
			console.log("ERROR: " + JSON.stringify(err));
			res.status(500);
		}
		console.log(sended);
		if (sended) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	});
});

app.get("*", (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname + "/views/404.html"));
});

app.listen(port, () => {
	console.log(`Serveur sur le port ${port}`);
});
