const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const Transport = require('nodemailer-brevo-transport');


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.name.split(' ')[0];
        this.url = url;
        this.from = `Jose Garcia <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //Brevo
            return nodemailer.createTransport({
//                service: 'Brevo'
                host: process.env.BREVO_HOST,
                port: process.env.BREVO_PORT,
                auth: {
                    user: process.env.BREVO_USERNAME,
                    pass: process.env.BREVO_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            //        GMAIL
            //        service: 'Gmail',
            //        auth: {
            //            user: process.env.EMAIL_USERNAME,
            //            pass: process.env.EMAIL_PASSWORD
            //        }
            //        Activate in gmail "less secure app" option

            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            logger: true,
            secure: false,
            tls: {
                rejectUnauthorized: true
            },
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }

        });
    };

    // Send the actual email
    async send(template, subject) {
        // 1. Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstname: this.firstname,
            url: this.url,
            subject: subject
        });
        // 2. Define the email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: htmlToText.convert(html)
        };
        // 3. Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10min)');
    }
};