const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: "lmn.mspr@gmail.com",
        pass: "ouiouiouimspradmin"
    }
})

message = {
    from: "lmn.mspr@gmail.com",
    to: "lmn.mspr@gmail.com",
    subject: "test",
    html: "<h1>Hello SMTP Email test</h1>"
}

transporter.sendMail(message, function(err, info) {
    if (err) {
        console.log(err)
    } else {
        console.log(info);
    }
});