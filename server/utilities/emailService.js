const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const smtpAuth = require("../config").smtpAuth;

const sendEmail = (mailDetails) => {
	// Gmail Template
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: smtpAuth,
	});

	// var transporter = nodemailer.createTransport(mailerConfig);

	// Open template file
	var source = fs.readFileSync(path.join(__dirname, "../templates/email.hbs"), "utf8");
	// Create email generator
	var template = Handlebars.compile(source);
	transporter.sendMail({ ...mailDetails, html: template(mailDetails.templateObj) }, function (err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log("Email sent", info);
		}
	});
};

const sendEmailVerificationOTP = async (user) => {
	sendEmail({
		from: "Personal Account Notification <donotreply@Stripe.com>",
		to: user.email,
		subject: "Personal Account Email Verification",
		templateObj: {
			name: user.firstName + " " + user.lastName,
			otp: user.otp,
			email: user.email,
			emailText: `<p>Please verify that your email address is ${user.email} and that you entered it when signing up for Personal Account.</p>
			<p>Enter this OTP to complete the Signup.</p>`,
		},
	});
};

module.exports = {
	sendEmailVerificationOTP,
};
