let mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
let uniqueValidator = require("mongoose-unique-validator");
let crypto = require("crypto");
let jwt = require("jsonwebtoken");
let secret = require("../config").secret;

const UserSchema = new mongoose.Schema(
	{
		firstName: { type: String, default: "" },
		lastName: { type: String, default: "" },
		status: {
			type: Number,
			default: 1,
			enum: [
				1, // 1: Active
				2, // 2: Blocked
				3, // 3: Pending
			],
		},

		//Necessary for login
		email: { type: String, required: true, lowercase: true, unique: true },
		role: {
			type: Number,
			default: 2,
			enum: [
				1, // 1: admin
				2, // 2: user
			],
		},

		//for otp verification
		otp: { type: String, default: null },
		otpExpires: { type: Date, default: null },
		isOtpVerified: { type: Boolean, default: false },

		//for password
		hash: String,
		salt: String,

		// for reset password
		resetPasswordToken: { type: String, default: null },
	},
	{ timestamps: true }
);

//for Validation and paginatation
UserSchema.plugin(uniqueValidator, { message: "is already taken." });
UserSchema.plugin(mongoosePaginate);

//Password processing
UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
	return this.hash === hash;
};

UserSchema.methods.generatePasswordRestToken = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
};

//OTP
UserSchema.methods.setOTP = function () {
	this.otp = Math.floor(1000 + Math.random() * 9000);
	this.otpExpires = Date.now() + 3600000; // 1 hour
};

UserSchema.methods.generateJWT = function () {
	return jwt.sign({ id: this._id, email: this.email }, secret, { expiresIn: "60d" });
};

UserSchema.methods.toAuthJSON = function () {
	return {
		email: this.email,
		firstName: this.firstName,
		lastName: this.lastName,

		role: this.role,
		status: this.status,
		token: this.generateJWT(),
	};
};

UserSchema.methods.toJSON = function () {
	return {
		email: this.email,
		firstName: this.firstName,
		lastName: this.lastName,

		role: this.role,
		status: this.status,
	};
};

module.exports = mongoose.model("User", UserSchema);
