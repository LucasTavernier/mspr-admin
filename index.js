const express = require("express");
var path = require("path");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "/public")));

app.get("/login", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/login.html"));
});

app.get("*", (req, res) => {
	// Here user can also design an
	// error page and render it
	res.send("PAGE INTROUVABLE - 404");
});

app.listen(port, () => {
	console.log(`Serveur sur le port ${port}`);
});
