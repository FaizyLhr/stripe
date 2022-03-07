let router = require("express").Router();
let { OkResponse, BadRequestResponse } = require("express-http-response");
const secretKey = require("../../config").secretKey;

const stripe = require("stripe")(secretKey);

// Charge Payment through Test Account
router.post("/payments", async (req, res, next) => {
	const product = req.body;
	const charge = await stripe.charges.create({
		amount: product.amount * 100,
		currency: "usd",
		source: "tok_amex",
		description: product.description,
	});
	// console.log("charge", charge);
	return next(new OkResponse(charge));
});

//Accept Payment through Live Account
// router.post("/pay", (req, res) => {
// 	console.log("req.body", req.body);
// 	stripe.charges.create(
// 		{
// 			amount: req.body.amount,
// 			currency: "usd",
// 			source: req.body.stripeToken,
// 			description: req.body.description,
// 		},
// 		(err, charge) => {
// 			if (err) {
// 				res.status(500).json(err.message);
// 			} else {
// 				res.status(201).json(charge);
// 			}
// 		}
// 	);
// });

// router.post("/payment", (req, res) => {
// 	stripe.customers
// 		.create({
// 			email: req.body.stripeEmail,
// 			source: req.body.stripeToken,
// 			name: "Gourav Hammad",
// 			address: {
// 				line1: "TC 9/4 Old MES colony",
// 				postal_code: "452331",
// 				city: "Indore",
// 				state: "Madhya Pradesh",
// 				country: "India",
// 			},
// 		})
// 		.then((customer) => {
// 			return stripe.charges.create({
// 				amount: 2500, // Charing Rs 25
// 				description: "Web Development Product",
// 				currency: "INR",
// 				customer: customer.id,
// 			});
// 		})
// 		.then((charge) => {
// 			res.send("Success"); //
module.exports = router;
