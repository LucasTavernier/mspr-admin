const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.exemple.com',
    port: 465 //25,
        // secure: false,
        //service: 'gmail',
        /*     auth: {
                user: 'l'
                email de votre serveur smtp ',
                pass: 'votre secret passcode'
            }, */
        /*     tls: {
                rejectUnauthorized: false
            }, */
});
var mailOptions = {
    from: 'votre-email.d@exemple.com',
    to: 'exemple@gmail.com',
    subject: "le sujet de votre email",
    text: "le contenu de votre email"
};
transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
})