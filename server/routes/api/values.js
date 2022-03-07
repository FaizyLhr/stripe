let router = require('express').Router();
let { OkResponse } = require("express-http-response");


router.get('/', (req, res, next) => {
    next(new OkResponse({message: 'OK'}))
})

module.exports = router;