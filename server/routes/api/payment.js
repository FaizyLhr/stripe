let router = require("express").Router();
let { OkResponse, BadRequestResponse } = require("express-http-response");
const secretKey = require("../../config").secretKey;
// const Stripe = require("stripe");

// const stripe = require("stripe")(publishableKey);
const stripe = require("stripe")(secretKey);
// var elements = stripe.elements();

// router.get("/", async (req, res, next) => {
// 	// Per Request API Key
// 	var charge = await stripe.charges.retrieve("ch_3KZE3JJwfiEbsL4t0OL3sOKA", {
// 		apiKey: "",
// 	});

// 	// per - request Account
// 	stripe.charges.retrieve("ch_3KZE3JJwfiEbsL4t0OL3sOKA", {
// 		stripeAccount: "acct_1KZD9qJwfiEbsL4t",
// 	});
// 	next(new OkResponse({ message: "OK" }));
// });

router.post("/create-checkout-session", async (req, res) => {
	console.log("req.body", req.body);
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: "T-shirt",
					},
					unit_amount: 2000,
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: "http://localhost:4200/success",
		cancel_url: "http://localhost:4200/cancel",
	});

	res.json({ id: session.id });
});

router.post("/create-payment-intent", (req, res) => {
	console.log("req.body", req.body);
	stripe.paymentIntents.create(
		{
			amount: parseInt(req.body.amount),
			currency: "usd",
			payment_method_types: ["card"],
		},
		function (err, paymentIntent) {
			if (err) {
				res.status(500).json(err.message);
			} else {
				res.status(201).json(paymentIntent);
			}
		}
	);
});

// Instant Pay
router.post("/pay", (req, res) => {
	console.log("req.body", req.body);
	req.body.amount = 10;
	req.body.amount = "usd";
	req.body.description = "description";
	stripe.charges.create(
		{
			amount: req.body.amount,
			currency: req.body.currency,
			source: "tok_visa",
			description: req.body.description,
		},
		(err, charge) => {
			if (err) {
				res.status(500).json(err.message);
			} else {
				res.status(201).json(charge);
			}
		}
	);
});

router.post("/payment", (req, res) => {
	stripe.customers
		.create({
			email: req.body.stripeEmail,
			source: req.body.stripeToken,
			name: "Gourav Hammad",
			address: {
				line1: "TC 9/4 Old MES colony",
				postal_code: "452331",
				city: "Indore",
				state: "Madhya Pradesh",
				country: "India",
			},
		})
		.then((customer) => {
			return stripe.charges.create({
				amount: 2500, // Charing Rs 25
				description: "Web Development Product",
				currency: "INR",
				customer: customer.id,
			});
		})
		.then((charge) => {
			res.send("Success"); // If no error occurs
		})
		.catch((err) => {
			res.send(err); // If some error occurs
		});
});

//server side implementation

//stripe Implementation

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

router.post("/payments", async (req, res, next) => {
	const product = req.body;
	console.log("product", product);
	const charge = await stripe.charges.create({
		amount: product.amount * 100,
		currency: "usd",
		source: "tok_amex",
		description: product.description,
	});
	console.log("charge", charge);
	return next(new OkResponse(charge));
});

module.exports = router;
