const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //create transporter - define a mail service to be used
  const {
    env: { MAIL_USER, MAIL_PASSWORD, MAIL_HOST, MAIL_PORT },
  } = process;

  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASSWORD,
    },
    port: MAIL_PORT,
    //activate in gmail "less secure app" option
  });
  //send email
  await transporter.sendMail({
    from: 'Mohd Zhafri <mzhafri@zhafri.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  });
};

module.exports = sendEmail;
