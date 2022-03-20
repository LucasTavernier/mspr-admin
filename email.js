const nodemailer = require("nodemailer");
require("dotenv").config();
var uuid = require("uuid");
var numUnique = uuid.v1();
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
let transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	auth: {
		user: email,
		pass: password,
	},
});

module.exports = function sendMail(mail, session, callback) {
	session.uuid = numUnique;

	message = {
		from: email,
		to: mail,
		subject: "test",
		html:
			"<h1>Bonjour,</h1><p>Veuillez valider votre adresse mail pour vous connecter.</p><p>Pour cela, cliquez sur le bouton ci-dessous:</p><a href='http://localhost:8085/confirm/" +
			numUnique +
			"'>Valider mon adresse mail</a>",
	};

	transporter.sendMail(message, function (err, info) {
		if (err) {
			console.log(err);
			return callback("problème d'envoi du mail", false);
		} else {
			console.log(info);
			return callback("mail envoyé", true);
		}
	});
};
