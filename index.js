//const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const route = express.Router();
const port = process.env.PORT || 5000;
app.use('/v1', route);
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const express = require("express");
var path = require("path");

//const app = express();
//const port = 8085;

app.use(express.static(path.join(__dirname, "/public")));

app.get("/login", function(req, res) {
    res.sendFile(path.join(__dirname + "/views/login.html"));
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/views/404.html"));
});

app.listen(port, () => {
    console.log(`Serveur sur le port ${port}`);
});