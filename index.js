require("dotenv").config();
const mysql = require("mysql2");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ActiveDirectory = require("activedirectory");
const rateLimit = require("express-rate-limit");
const sendMail = require("./email");
const axios = require("axios").default;
var uuid = require("uuid");

var config = {
	url: "ldap://192.168.28.131/mspr-admin.local",
	baseDN: "dc=mspr-admin,dc=local",
};

const db = mysql.createConnection({
	host: "127.0.0.1",
	user: process.env.USERBDD,
	password: process.env.PASSWORDBDD,
	database : "mspradmin"
  });

  let ip = "";
  axios
  .get("https://ipapi.co/json/")
  .then(function (response) {
	  ip = response;
  })
  .catch(function (error) {
	  console.error(error);
  });


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
		res.sendFile(path.join(__dirname + "/views/connecte.html"));
	} else {
		res.sendFile(path.join(__dirname + "/views/login.html"));
	}
});

app.get("/deconnexion", function(req, res){
	if (req.session) {
		req.session.destroy();
	}
	res.redirect("/");
})

app.get("/username", function(req, res){
	res.send(""+req.session.login);
});

app.get("/doubleAuth", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/doubleAuth.html"));
});

app.get("/changeIp/:ip", (req, res) =>{
	let ip = req.params.ip;

	if(req.session.loggedin){
		db.connect(function(err) {
			if (err) throw err;
			db.query("SELECT * FROM users WHERE login ='" + req.session.login+"'", function (err, result, fields) {
			  if (err) throw err;
			  	if(result.length > 0){ //si l'utilisateur existe
					db.query (
						"UPDATE users SET ip = ? WHERE login ='"+req.session.login + "'", 
						[ip]
					);
				}
			});
		});
		res.status(200).end("Votre ip a bien ete change !");
	}
});

app.get("/confirm", (req, res) => {
	res.sendFile(path.join(__dirname + "/views/confirm.html"));
});

app.get("/confirm/:id", (req, res) => {
	let id = req.params.id;

	if (req.session.uuid == id) {
		req.session.loggedin = true;
		let nav = req.headers['user-agent'];

		db.connect(function(err) {
			if (err) throw err;
			db.query("SELECT * FROM users WHERE login ='" + req.session.login+"'", function (err, result, fields) {
			  if (err) throw err;
			  if(result.length > 0){ //si l'utilisateur existe
				db.query (
					"UPDATE users SET mail = ? WHERE login ='"+req.session.login + "'", 
					[req.session.mail]
				);

				textMaybeError = "";
				if(result[0].nav != nav){
					textMaybeError += "Attention, une connexion suspecte a été détecté à partir" + 
					" d'un nouveau navigateur ["+nav+"], l'habituel étant ["+result[0].nav+"].";
				}
				if(result[0].ip != ip.data['ip']){
					if(textMaybeError != ""){
						textMaybeError +="<br>De plus, une nouvelle ip a été détectée ["+ip.data['ip']+"], l'habituel étant ["+result[0].ip+"]."
					}else{
						textMaybeError += "Attention, une connexion suspecte a été détecté à partir" + 
					" d'une nouvelle ip ["+ip.data['ip']+"], l'habituel étant ["+result[0].ip+"].";
					textMaybeError += "<br> <a href='http://localhost/changeIp/" + ip.data['ip'] + "'>Changer mon adresse ip habituelle</a>"
					}
				}

				if(textMaybeError != ""){
					sendMail(result[0].mail, req.session, function (err, sended) {
						if (err) {
							console.log("ERROR: " + JSON.stringify(err));
							res.status(500);
						}
						console.log(sended);
						if (sended) {
							req.session.mail = mail;
							req.session.uuid = numUnique;
							res.status(200).end();
						} else {
							res.status(400).end();
						}
					}, 
					"ATTENTION CONNEXION SUSPECTE",
					textMaybeError
					);
			  }
			}else{
				db.query (
					'INSERT INTO users '+
					'SET login = ?, nav = ?, ip = ?',
					[req.session.login,nav, ip.data["ip"]]
				);
			  }
			}
		);
		});
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
			res.redirect("/");
		}
		if (auth) {
			console.log("Connecté !");
			res.status(200);

			req.session.login = username;

			res.redirect("/doubleAuth");
		} else {
			console.log("Connexion ratée !");
			res.status(403);
		}
	});
});

app.post("/doubleAuth", function (req, res) {
	let mail = req.body.email;
	var numUnique = uuid.v1();

	sendMail(mail, req.session, function (err, sended) {
		if (err) {
			console.log("ERROR: " + JSON.stringify(err));
			res.status(500);
		}
		console.log(sended);
		if (sended) {
			req.session.mail = mail;
			req.session.uuid = numUnique;
			res.status(200).end("Un mail a ete envoye a :" + mail);
		} else {
			res.status(400).end("Impossible d'envoyer le mail a : " + mail);
		}
	}, 
	"DOUBLE AUTHENTIFICATION",
	"<h1>Bonjour,</h1><p>Veuillez valider votre adresse mail pour vous connecter.</p><p>Pour cela, cliquez sur le bouton ci-dessous:</p><a href='http://localhost/confirm/" +
			numUnique +
			"'>Valider mon adresse mail</a>"
	);
});

app.get("*", (req, res) => {
	console.log(ip.data["country_name"]);
	if(ip.data["country_name"] != "France"){
		session.countryBlocked = true;
	}else{
		if(session.countryBlocked == true){
			session.countryBlocked = false;
		}
	}

	if(req.session.countryBlocked == true){
		res.status(403);
		res.sendFile(path.join(__dirname + "/views/interdit.html"));
	}else{
		res.status(404);
		res.sendFile(path.join(__dirname + "/views/404.html"));
	}
});

app.listen(port, () => {
	console.log(`Serveur sur le port ${port}`);
});
