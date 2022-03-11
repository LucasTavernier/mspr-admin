const nodemailer = require("nodemailer");
require("dotenv").config();
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

    message = {
        from: email,
        to: mail,
        subject: "CONNEXION SUSPECTE",
        html: "<h1>Attention,</h1><p>Une connexion suspecte a été détectée à partir d'une nouvelle adresse IP.",
    };

    transporter.sendMail(message, function(err, info) {
        if (err) {
            console.log(err);
            return callback("problème d'envoi du mail", false);
        } else {
            console.log(info);
            return callback("mail envoyé", true);
        }
    });
};