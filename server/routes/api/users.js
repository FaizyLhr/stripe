let router = require("express").Router();

const passport = require("passport");

let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");

// const { isBlocked, isUnBlocked } = require("../../middleWares/authentications");

const User = require("../../models/User");

const auth = require("../auth");

var emailService = require("../../utilities/emailService");

// get user for every time mail given
router.param("email", (req, res, next, email) => {
	User.findOne({ email }, (err, user) => {
		if (!err && user !== null) {
			req.emailUser = user;
			return next();
		}
		return next(new BadRequestResponse("User not found!", 423));
	});
});

// Signup
router.post("/signUp", async (req, res, next) => {
	if (!req.body.user || !req.body.user.email || !req.body.user.firstName || !req.body.user.lastName || !req.body.user.password) {
		return next(new BadRequestResponse("Missing Required parameters"));
	} else if (req.body.user.email.length === 0 || req.body.user.firstName.length === 0 || req.body.user.lastName === 0 || req.body.user.password.length === 0) {
		return next(new BadRequestResponse("Missing Required parameters"));
	}

	// Create user in our database
	let newUser = User();
	newUser.email = req.body.user.email;
	newUser.firstName = req.body.user.firstName;
	newUser.lastName = req.body.user.lastName;
	// newUser.status = 3;

	newUser.setPassword(req.body.user.password);
	newUser.setOTP();

	newUser.save((err, result) => {
		if (err) {
			return next(new BadRequestResponse(err));
		} else {
			emailService.sendEmailVerificationOTP(result);
			return next(new OkResponse(result));
		}
	});
});

// verifyOTP
router.post("/otp/verify/:email/:type", (req, res, next) => {
	if (!req.body.otp) {
		return next(new BadRequestResponse("Missing required parameter", 422));
	}

	let query = {
		email: req.emailUser.email,
		otp: req.body.otp,
		otpExpires: { $gt: Date.now() },
	};

	User.findOne(query, function (err, user) {
		if (err || !user) {
			return next(new UnauthorizedResponse("Invalid OTP"));
		}
		user.otp = null;
		user.otpExpires = null;
		if (+req.params.type === 1) {
			user.isOtpVerified = true;
			console.log("user is verified");
		} else {
			user.generatePasswordRestToken();
		}

		user.save().then(function () {
			if (+req.params.type === 1) {
				return next(new OkResponse(user.toAuthJSON()));
			} else if (+req.params.type === 2) {
				return next(new OkResponse({ passwordRestToken: user.resetPasswordToken }));
			}
		});
	});
});

// Resend OTP
router.post("/otp/resend/:email", (req, res, next) => {
	req.emailUser.setOTP();
	req.emailUser.save((err, user) => {
		emailService.sendEmailVerificationOTP(req.emailUser);
		return next(
			new OkResponse({
				message: "OTP sent Successfully to registered email address",
			})
		);
	});
});

// Reset Password
router.post("/reset/password/:email", (req, res, next) => {
	if (!req.body.resetPasswordToken || !req.body.password) {
		return next(new UnauthorizedResponse("Missing Required Parameters"));
	}
	if (req.body.resetPasswordToken !== req.emailUser.resetPasswordToken) {
		return next({ err: new UnauthorizedResponse("Invalid Password Reset Token") });
	}
	req.emailUser.setPassword(req.body.password);
	req.emailUser.resetPasswordToken = null;
	req.emailUser.isEmailVerified = true;
	req.emailUser.save((err, user) => {
		if (err) return next(new BadRequestResponse(err));
		return next(new OkResponse(user.toAuthJSON()));
	});
});

// Login
router.post("/login", (req, res, next) => {
	console.log(req.body);
	passport.authenticate("local", { session: false }, (err, user, info) => {
		if (err) return next(new BadRequestResponse(err));
		if (!user) {
			return next(new BadRequestResponse("No User Found"));
		}
		if (!user.isOtpVerified) {
			return next(new UnauthorizedResponse("Your email is not verified", 401));
		} else if (+user.status === 2) {
			return next(new UnauthorizedResponse("Your Account is Blocked!, Contact to Support please", 403));
		} else if (+user.status === 3) {
			return next(new UnauthorizedResponse("Your Account is Pending!, Contact to Support please", 403));
		} else {
			return next(new OkResponse(user.toAuthJSON()));
		}
	})(req, res, next);
});

// User context Api
router.get("/context", auth.required, auth.user, (req, res, next) => {
	let user = req.user;
	return next(new OkResponse(user.toAuthJSON()));
});

// Block Specific User
// router.put("/block/:email", auth.required, auth.admin, isBlocked, async (req, res, next) => {
// 	// console.log(req.user);
// 	req.emailUser.status = 2;
// 	req.emailUser.token = "";

// 	req.emailUser.save((err, result) => {
// 		if (err) return next(new BadRequestResponse(err));
// 		return next(new OkResponse(req.emailUser));
// 	});
// });

// UnBlock Specific User
// router.put("/unBlock/:email", auth.required, auth.admin, isUnBlocked, async (req, res, next) => {
// 	req.emailUser.status = 1;
// 	req.emailUser.save((err, result) => {
// 		if (err) return next(new BadRequestResponse(err));
// 		return next(new OkResponse(req.emailUser.toAuthJSON()));
// 	});
// });

// View All users
router.get("/all", auth.required, auth.admin, (req, res, next) => {
	const options = {
		page: +req.query.page || 1,
		limit: +req.query.limit || 25,
	};

	let query = {};
	query.role = 2;

	User.paginate(query, options, (err, result) => {
		if (err) return next(new BadRequestResponse(err), 500);
		return next(new OkResponse(result));
	});
});

// Get Students Count
router.get("/count", auth.required, auth.admin, (req, res, next) => {
	User.count({ role: 2 }, (err, count) => {
		if (err) next(new BadRequestResponse(err));
		return next(new OkResponse({ count }));
	});
});

// Get Active Students Count
router.get("/activeCount", auth.required, auth.admin, (req, res, next) => {
	User.count({ role: 2, status: 1 }, (err, count) => {
		if (err) next(new BadRequestResponse(err));
		return next(new OkResponse({ count }));
	});
});

// Get deActive Students Count
router.get("/deActiveCount", auth.required, auth.admin, (req, res, next) => {
	User.count({ role: 2, status: 2 }, (err, count) => {
		if (err) next(new BadRequestResponse(err));
		return next(new OkResponse({ count }));
	});
});

// View Specific User
router.get("/view/:email", auth.required, (req, res, next) => {
	User.findOne({
		email: req.emailUser.email,
	})
		.then((user) => {
			return next(new OkResponse(user));
		})
		.catch((err) => {
			return next(new BadRequestResponse(err));
		});
});

// Update Specific User
router.put("/edit", auth.required, auth.user, (req, res, next) => {
	if (req.body.school) {
		if (!req.body.schoolCode) {
			return next(new BadRequestResponse("Missing Required parameters"));
		} else if (req.body.schoolCode.length === 0) {
			return next(new BadRequestResponse("Missing Required parameters"));
		}
	}
	if (req.body.schoolCode) {
		if (!req.body.school) {
			return next(new BadRequestResponse("Missing Required parameters"));
		} else if (req.body.school.length === 0) {
			return next(new BadRequestResponse("Missing Required parameters"));
		}
	}

	if (req.body.school) {
		School.findOne({ code: req.body.schoolCode }, (err, school) => {
			if (err) return next(new BadRequestResponse(err));
			if (!school) {
				return next(new UnauthorizedResponse("Not Authorized Or School Code Not Matched"));
			}

			req.user.school = req.body.school || req.user.school;
			req.user.schoolCode = req.body.schoolCode || req.user.schoolCode;
			req.user.save((err, user) => {
				if (err) return next(new BadRequestResponse(err));
				return next(new OkResponse(user));
			});
		});
	} else {
		req.user.name = req.body.name || req.user.name;
		req.user.save((err, user) => {
			if (err) return next(new BadRequestResponse(err));
			return next(new OkResponse(user));
		});
	}
});

module.exports = router;
