const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'safeplus94@gmail.com',
    pass: 'dpyg xqpb pnvi ghat',
  },
});

async function sendCredentialsEmail(email, password) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your SafePlus Account Credentials",
    text: `Hello, here are your login ,credentials:\n\nUsername: ${email}\nPassword: ${password}\n\nPlease login and change your password.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendCredentialsEmail };