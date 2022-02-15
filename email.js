const nodemailer = require('nodemailer');
require('dotenv').config();

const email = process.env.EMAIL
const password = process.env.PASSWORD
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: email,
        pass: password
    }
})

message = {
    from: email,
    to: "lmn.mspr@gmail.com",
    subject: "test",
    html: "<h1>Bonjour,</h1><p>Veuillez valider votre adresse mail pour vous connecter.</p><p>Pour cela, cliquez sur le bouton ci-dessous:</p><a href='http://localhost:8085/confirm'>Valider mon adresse mail</a>"
}

transporter.sendMail(message, function(err, info) {
    if (err) {
        console.log(err)
    } else {
        console.log(info);
    }
});