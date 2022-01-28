const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SENDGRID_KEY, MAIL_ADDRESS } = process.env;

sgMail.setApiKey(SENDGRID_KEY);

/*
data = {
    to: "mail@domen.com",
    from: "yourMail@mail.com"
    subject: "Your Query",
    text: "Your text..."
    html: "<p>Your text...</p>"
}
*/

const sendEmail = async (data, next) => {
  try {
    const email = { ...data, from: MAIL_ADDRESS };
    await sgMail.send(email);
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = sendEmail;
