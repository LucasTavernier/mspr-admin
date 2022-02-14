const express = require("express");
var path = require("path");

const app = express();
const port = 8085;

app.use(express.static(path.join(__dirname, "/public")));

app.get("/login", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/login.html"));
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/views/404.html"));
});

app.listen(port, () => {
	console.log(`Serveur sur le port ${port}`);
});
