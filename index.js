const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ActiveDirectory = require("activedirectory");
const rateLimit = require("express-rate-limit");

var config = {
	url: "ldap://dc.domain.com",
	baseDN: "dc=domain,dc=com",
};

//On a le droit à 5 requêtes en 1 minute, sinon on est bloqué 1 minute
const limiter = rateLimit({
	max: 5,
	windowMs: 1 * 60 * 1000,
	message: "Trop de requête depuis cette ip",
});

var ad = new ActiveDirectory(config);

const app = express();
const port = 8085;

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);


app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/login.html"));
});

app.get("/login", function(req, res) {
    res.sendFile(path.join(__dirname + "/views/login.html"));
});

app.get("/confirm", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/confirm.html"));
});

app.post("/auth", function (req, res) {
	let username = req.body.username;
	let password = req.body.password;

	ad.authenticate(username, password, function (err, auth) {
		if (err) {
			console.log("ERROR: " + JSON.stringify(err));
			return;
		}
		if (auth) {
			console.log("Connecté !");
		} else {
			console.log("Connexion ratée !");
		}
	});
});

app.get("*", (req, res) => {
	res.status(404);
	res.sendFile(path.join(__dirname + "/views/404.html"));
});


app.listen(port, () => {
    console.log(`Serveur sur le port ${port}`);
})